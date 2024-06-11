import { WebSocket, WebSocketServer } from "ws";
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
            session = new Session(sessionID);
            this.sessions.push(session);
        }
        session.addUser(user);
        console.log(`User ${userID} joined session ${sessionID} as ${isAdmin ? "admin" : "user"}`)
    }

    removeUser(socket: WebSocket, sessionID: number, userID: string) {
        let session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) {
            return;
        }
        const user = session.users.find((user: User) => (user.id === userID) && (user.socket === socket));
        if (user) {
            session.removeUser(user);
        }
        if (session.users.length === 0) {
            this.sessions = this.sessions.filter((session: Session) => session.id !== sessionID);
        }
        console.log(`User ${userID} left session ${sessionID}`)
    }

    addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case "sync":
                    this.broadcast(socket, message.sessionID, JSON.stringify({ type: "sync", songs: message.songs, index: message.index}));
                    break;
                case "play":
                    this.broadcast(socket, message.sessionID, JSON.stringify({ type: "play" }));
                    break;
                case "pause":
                    this.broadcast(socket, message.sessionID, JSON.stringify({ type: "pause" }));
                    break;
                case "seek":
                    this.broadcast(socket, message.sessionID, JSON.stringify({ type: "seek", time: message.time }));
                    break;
                case "join":
                    this.addUser(socket, message.sessionID, message.userID, message.isAdmin);
                    break;
                case "leave":
                    this.removeUser(socket, message.sessionID, message.userID);
                    break;
                default:
                    console.error("Unknown message type");
            }
        });

        socket.on('close', () => {
            this.sessions.forEach(session => {
                const user = session.users.find(u => u.socket === socket);
                if (user) {
                    session.removeUser(user);
                    if (session.users.length === 0) {
                        this.sessions = this.sessions.filter(s => s !== session);
                    }
                }
            });
        });
    }

    private broadcast(socket: WebSocket, sessionID: number, message: string) {
        const session = this.sessions.find((session: Session) => session.id === sessionID);
        if (!session) {
            return;
        }
        session.users.forEach((user: User) => {
            if (user.socket !== socket) {
                user.socket.send(message);
            }
        });
    }
}

