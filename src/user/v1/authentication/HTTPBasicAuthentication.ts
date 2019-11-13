import { HTTPAuthentication } from './HTTPAuthentication'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { IUserManager } from '../IUserManager'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'

export class HTTPBasicAuthentication implements HTTPAuthentication
{
    constructor(public realm : string = 'realm')
    { }

    askForAuthentication()
    {
        return {
            'WWW-Authenticate': 'Basic realm="' + this.realm + '"'
        }
    }

    getUser(arg : MethodCallArgs, userManager : IUserManager, callback : (error : Error, user : IUser) => void)
    {
        const onError = (error : Error) =>
        {
            userManager.getDefaultUser((defaultUser) => {
                callback(error, defaultUser)
            })
        }

        const authHeader = arg.findHeader('Authorization')
        if(!authHeader)
        {
            onError(Errors.MissingAuthorisationHeader)
            return;
        }
        if(!/^Basic \s*[a-zA-Z0-9]+=*\s*$/.test(authHeader))
        {
            onError(Errors.WrongHeaderFormat);
            return;
        }

        const value = /^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(authHeader)[1];
        
        userManager.getUsers((e, users) => {
            if(e)
            {
                onError(e);
                return;
            }
            
            for(const user of users)
            {
                const expected = Buffer.from(user.username + ':' + (user.password ? user.password : '')).toString('base64')

                if(value === expected)
                {
                    callback(Errors.None, user);
                    return;
                }
            }

            onError(Errors.BadAuthentication);
        });
    }
}
