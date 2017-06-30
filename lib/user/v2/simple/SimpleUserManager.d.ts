import { ITestableUserManager } from '../userManager/ITestableUserManager';
import { IListUserManager } from '../userManager/IListUserManager';
import { IUser } from '../IUser';
export declare class SimpleUserManager implements ITestableUserManager, IListUserManager {
    protected users: any;
    constructor();
    getUserByName(name: string, callback: (error: Error, user?: IUser) => void): void;
    getDefaultUser(callback: (user: IUser) => void): void;
    addUser(name: string, password: string, isAdmin?: boolean): IUser;
    getUsers(callback: (error: Error, users: IUser[]) => void): void;
    getUserByNamePassword(name: string, password: string, callback: (error: Error, user?: IUser) => void): void;
}
