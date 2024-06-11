import { WebSocket } from "ws";

export class User {
    public id: string;
    public socket: WebSocket;
    public isAdmin: boolean

    constructor(id: string, socket: WebSocket, isAdmin: boolean) {
        this.id = id;
        this.socket = socket;
        this.isAdmin = isAdmin;
    }
}