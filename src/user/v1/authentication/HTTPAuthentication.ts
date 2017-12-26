import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { IUserManager } from '../IUserManager'
import { IUser } from '../IUser'

export interface HTTPAuthentication
{
    realm : string

    askForAuthentication() : any
    getUser(arg : MethodCallArgs, userManager : IUserManager, callback : (error : Error, user : IUser) => void)
}
