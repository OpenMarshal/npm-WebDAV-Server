import { IUser } from './IUser'

export interface IUserManager
{
    getUserByName(name : string, callback : (error : Error, user : IUser) => void)
    getDefaultUser(callback : (user : IUser) => void)
    getUsers(callback : (error : Error, users : IUser[]) => void)
}
