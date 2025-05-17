import { WebSocket } from "ws";
import { User } from "./User";
import { Session } from "./Session";

export class SessionManager {
    public sessions: Session[];

    constructor() {
        this.sessions = [];
    }

    addUser(socket: WebSocket, sessionID: number, userID: string, isAdmin: boolean) {
        const user = new User(userID, socket, isAdmin);
        let session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) {
            if (isAdmin) {
                session = new Session(sessionID);
                this.sessions.push(session);
            } else {
                socket.send(JSON.stringify({ type: "joinerror", message: "Session does not exist!" }));
                return;
            }    
        }
        session.addUser(user);
        socket.send(JSON.stringify({ type: "joinsuccess", message: `Joined the session ${(isAdmin) ? "as an admin" : "as a member"}` }));
        
        // If a non-admin joins, notify the admin to send a sync
        if (!isAdmin) {
            const admin = session.users.find((u: User) => u.isAdmin);
            if (admin) {
                admin.socket.send(JSON.stringify({ 
                    type: "syncRequest", 
                    sessionID: sessionID,
                    userID: userID 
                }));
            }
        }
        
        console.log(`User ${userID} joined session ${sessionID} as ${isAdmin ? "admin" : "member"}`);
    }

    removeUser(socket: WebSocket, sessionID: number, userID: string) {
        let session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) {
            socket.send(JSON.stringify({ type: "leaveerror", message: "Session does not exist!" }));
            return;
        }
        const user = session.users.find((user: User) => (user.id === userID) && (user.socket === socket));
        if (user) {
            session.removeUser(user);
        }
        if (session.users.length === 0) {
            this.sessions = this.sessions.filter((session: Session) => session.id !== sessionID);
        }
        socket.send(JSON.stringify({ type: "leavesuccess", message: "Left the session" }));
        console.log(`User ${userID} left session ${sessionID}`)
    }

    addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case "sync":
                        this.broadcast(socket, message.sessionID, JSON.stringify({ 
                            type: "sync", 
                            songs: message.songs, 
                            index: message.index, 
                            duration: message.duration, 
                            progress: message.progress,
                            isPlaying: message.isPlaying
                        }));
                        break;
                    case "requestSync":
                        this.requestSync(message.sessionID, message.userID);
                        break;
                    case "syncRequest":
                        // Individual sync request from a specific user
                        this.syncToSpecificUser(socket, message.sessionID, message.userID);
                        break;
                    case "nextsong":
                        this.broadcast(socket, message.sessionID, JSON.stringify({ 
                            type: "nextsong", 
                            index: message.index 
                        }));
                        break;    
                    case "play":
                        this.broadcast(socket, message.sessionID, JSON.stringify({ 
                            type: "play",
                            // Additional info to help with song creation on clients
                            index: message.index,
                            progress: message.progress
                        }));
                        break;
                    case "pause":
                        this.broadcast(socket, message.sessionID, JSON.stringify({ 
                            type: "pause",
                            progress: message.progress
                        }));
                        break;
                    case "seek":
                        this.broadcast(socket, message.sessionID, JSON.stringify({ 
                            type: "seek", 
                            time: message.time 
                        }));
                        break;
                    case "join":
                        this.addUser(socket, message.sessionID, message.userID, message.isAdmin);
                        break;
                    case "leave":
                        this.removeUser(socket, message.sessionID, message.userID);
                        break;
                    default:
                        console.error("Unknown message type:", message.type);
                }
            } catch (error) {
                console.error("Error processing message:", error);
                socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
            }
        });

        socket.on('close', () => {
            this.sessions.forEach(session => {
                const user = session.users.find(u => u.socket === socket);
                if (user) {
                    session.removeUser(user);
                    console.log(`User ${user.id} disconnected from session ${session.id}`);
                    
                    // Notify remaining users about the disconnection
                    session.users.forEach((u: User) => {
                        u.socket.send(JSON.stringify({ 
                            type: "userDisconnected", 
                            userID: user.id,
                            wasAdmin: user.isAdmin
                        }));
                    });
                    
                    if (session.users.length === 0) {
                        this.sessions = this.sessions.filter(s => s !== session);
                        console.log(`Session ${session.id} closed - no users remaining`);
                    } else if (user.isAdmin) {
                        // If the admin disconnected, try to promote another user
                        const newAdmin = session.users[0];
                        if (newAdmin) {
                            newAdmin.isAdmin = true;
                            newAdmin.socket.send(JSON.stringify({ 
                                type: "adminPromoted", 
                                message: "You have been promoted to admin" 
                            }));
                            console.log(`User ${newAdmin.id} promoted to admin in session ${session.id}`);
                        }
                    }
                }
            });
        });
    }

    private requestSync(sessionID: number, userID: string) {
        const session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) return;

        const admin = session.users.find((user: User) => user.isAdmin);
        if (admin) {
            admin.socket.send(JSON.stringify({ 
                type: "syncRequest", 
                sessionID: sessionID,
                userID: userID
            }));
        }
    }

    private syncToSpecificUser(socket: WebSocket, sessionID: number, targetUserID: string) {
        const session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) return;

        const targetUser = session.users.find((user: User) => user.id === targetUserID);
        if (!targetUser) return;

        // The admin is requesting to sync to a specific user
        // We need to request the current state from the admin again
        socket.send(JSON.stringify({ 
            type: "requestCurrentState", 
            sessionID: sessionID,
            userID: targetUserID
        }));
    }

    private broadcast(socket: WebSocket, sessionID: number, message: string) {
        const session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) {
            return;
        }
        session.users.forEach((user: User) => {
            if (user.socket !== socket && user.socket.readyState === WebSocket.OPEN) {
                try {
                    user.socket.send(message);
                } catch (error) {
                    console.error(`Error sending message to user ${user.id}:`, error);
                }
            }
        });
    }
}