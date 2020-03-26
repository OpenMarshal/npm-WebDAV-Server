import { IUser } from '../IUser'
import { HTTPRequestContext } from '../../../server/v2/RequestContext'

export interface ITestableUserManager
{
    getDefaultUser(ctx : HTTPRequestContext, callback : (user : IUser) => void)
    getUserByNamePassword(ctx : HTTPRequestContext, name : string, password : string, callback : (error : Error, user ?: IUser) => void)
}
