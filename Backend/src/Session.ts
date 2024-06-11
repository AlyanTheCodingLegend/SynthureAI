import { User } from "./User";

export class Session {
    public id: number;
    public users: User[];

    constructor(id: number) {
        this.id = id;
        this.users = [];
    }

    addUser(user: User) {
        this.users.push(user);
    }

    removeUser(user: User) {
        this.users = this.users.filter((u: User) => u.id !== user.id);
    }
}
