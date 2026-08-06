import { IUser } from "../IUser";
import { IUserValidator } from "./IUserValidator";

export class SimpleUserValidator implements IUserValidator
{
    public isUserValid(user: IUser): boolean
    {
        return typeof user === 'object' && user !== null && typeof user.uid === 'string';
    }
}