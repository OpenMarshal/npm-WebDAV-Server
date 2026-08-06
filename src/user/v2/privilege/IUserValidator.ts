import { IUser } from "../IUser";

export interface IUserValidator
{
    isUserValid(user: IUser): boolean;
}