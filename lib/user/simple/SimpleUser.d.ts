import { IUser } from '../IUser';
export declare class SimpleUser implements IUser {
    username: string;
    password: string;
    isAdministrator: boolean;
    isDefaultUser: boolean;
    constructor(username: string, password: string, isAdministrator: boolean, isDefaultUser: boolean);
}
