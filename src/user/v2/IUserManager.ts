import { IUser } from './IUser'
import { HTTPRequestContext } from '../../server/v2/RequestContext'

export interface IUserManager
{
    getDefaultUser(ctx : HTTPRequestContext, callback : (user : IUser) => void)
}
