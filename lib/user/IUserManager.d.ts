import { IUser } from './IUser';
export interface IUserManager {
    getUserByName(name: string, callback: (error: Error, user: IUser) => void): any;
    getDefaultUser(callback: (user: IUser) => void): any;
    getUsers(callback: (error: Error, users: IUser[]) => void): any;
}
