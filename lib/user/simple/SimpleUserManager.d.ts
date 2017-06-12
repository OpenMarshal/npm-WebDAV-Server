import { IUserManager } from '../IUserManager';
import { IUser } from '../IUser';
export declare class SimpleUserManager implements IUserManager {
    protected users: any;
    constructor();
    getUserByName(name: string, callback: (error: Error, user: IUser) => void): void;
    getDefaultUser(callback: (user: IUser) => void): void;
    addUser(name: string, password: string, isAdmin?: boolean): IUser;
    getUsers(callback: (error: Error, users: IUser[]) => void): void;
}
