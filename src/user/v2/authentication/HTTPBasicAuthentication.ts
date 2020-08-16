import { ITestableUserManager } from '../userManager/ITestableUserManager'
import { HTTPAuthentication } from './HTTPAuthentication'
import { HTTPRequestContext } from '../../../server/v2/RequestContext'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'

export class HTTPBasicAuthentication implements HTTPAuthentication
{
    constructor(public userManager : ITestableUserManager, public realm : string = 'realm')
    { }

    askForAuthentication(ctx : HTTPRequestContext)
    {
        return {
            'WWW-Authenticate': 'Basic realm="' + this.realm + '"'
        }
    }

    getUser(ctx : HTTPRequestContext, callback : (error : Error, user : IUser) => void)
    {
        const onError = (error : Error) =>
        {
            this.userManager.getDefaultUser((defaultUser) => {
                callback(error, defaultUser)
            })
        }

        const authHeader = ctx.headers.find('Authorization')
        if(!authHeader)
        {
            onError(Errors.MissingAuthorisationHeader)
            return;
        }
        if(!/^Basic /.test(authHeader))
        {
            onError(Errors.WrongHeaderFormat);
            return;
        }

        const value = Buffer.from(authHeader.slice(6).trim(), 'base64').toString().split(':', 2);
        const username = value[0];
        const password = value[1];

        this.userManager.getUserByNamePassword(username, password, (e, user) => {
            if(e)
                onError(Errors.BadAuthentication);
            else
                callback(null, user);
        });
    }
}
