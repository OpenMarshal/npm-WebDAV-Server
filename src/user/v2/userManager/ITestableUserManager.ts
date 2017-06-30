import { IUser } from '../IUser'

export interface ITestableUserManager
{
    getDefaultUser(callback : (user : IUser) => void)
    getUserByNamePassword(name : string, password : string, callback : (error : Error, user ?: IUser) => void)
}
