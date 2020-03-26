import { IUser } from '../IUser'
import { HTTPRequestContext } from '../../../server/v2/RequestContext'

export interface IListUserManager
{
    getUserByName(ctx : HTTPRequestContext, name : string, callback : (error : Error, user ?: IUser) => void)
    getDefaultUser(ctx : HTTPRequestContext, callback : (user : IUser) => void)
    getUsers(ctx : HTTPRequestContext, callback : (error : Error, users ?: IUser[]) => void)
}
