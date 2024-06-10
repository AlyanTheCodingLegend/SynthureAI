import { WebSocket } from "ws";

export class Session {
    public id : number;
    public users : WebSocket[];

    constructor() {
        this.id = Math.floor(Math.random() * 900) + 100;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket)
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter((user: WebSocket ) => user !== socket)
    }
}