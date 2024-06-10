import { WebSocket } from "ws"
import { Session } from "./Session"

export class SessionManager {
    public sessions: Session[]

    constructor() {
        this.sessions = []
    }

    addUser(socket: WebSocket, sessionID: number) {
        let session = this.sessions.find((session: Session) => session.id === sessionID)
        if (!session) {
            session = new Session()
            this.sessions.push(session)
        }
        session.addUser(socket)
    }

    removeUser(socket: WebSocket, sessionID: number) {
        let session = this.sessions.find((session: Session) => session.id === sessionID)
        if (!session) {
            return
        }
        session.removeUser(socket)
        if (session.users.length === 0) {
            this.sessions = this.sessions.filter((session: Session) => session.id !== sessionID)
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString())

            if (message.type === "play") {
                const session = this.sessions.find((session: Session) => session.id === message.sessionID)
                if (!session) {
                    return
                } else {
                    session.users.forEach((user: WebSocket) => {
                        if (user !== socket) {
                            user.send(JSON.stringify({ type: "play", songs: message.songs, songid: message.songid}))
                        }
                    })
                }
            } else if (message.type === "pause") {
                const session = this.sessions.find((session: Session) => session.id === message.sessionID)
                if (!session) {
                    return
                } else {
                    session.users.forEach((user: WebSocket) => {
                        if (user !== socket) {
                            user.send(JSON.stringify({ type: "pause"}))
                        }
                    })
                }
            } else if (message.type === "seek") {
                const session = this.sessions.find((session: Session) => session.id === message.sessionID)
                if (!session) {
                    return
                } else {
                    session.users.forEach((user: WebSocket) => {
                        if (user !== socket) {
                            user.send(JSON.stringify({ type: "seek", time: message.time }))
                        }
                    })
                }
            } else if (message.type === "join") {
                this.addUser(socket, message.sessionID)
            } else if (message.type === "leave") {
                this.removeUser(socket, message.sessionID)
            } else {
                console.error("Unknown message type")
            }
        })
    }
}