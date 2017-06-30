import { IUser } from './IUser'

export interface IUserManager
{
    getDefaultUser(callback : (user : IUser) => void)
}
