import { md5, parseHTTPAuthHeader } from '../../CommonFunctions'
import { HTTPAuthentication } from './HTTPAuthentication'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { IUserManager } from '../IUserManager'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'
import * as crypto from 'crypto'

export class HTTPDigestAuthentication implements HTTPAuthentication
{
    constructor(public realm : string = 'realm', public nonceSize : number = 50)
    { }

    generateNonce() : string
    {
        const buffer = Buffer.alloc(this.nonceSize);
        for(let i = 0; i < buffer.length; ++i)
            buffer[i] = Math.floor(Math.random() * 256);

        return md5(buffer);
    }

    askForAuthentication()
    {
        return {
            'WWW-Authenticate': 'Digest realm="' + this.realm + '", qop="auth,auth-int", nonce="' + this.generateNonce() + '", opaque="' + this.generateNonce() + '"'
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

        let authHeader = arg.findHeader('Authorization')
        if(!authHeader)
            return onError(Errors.MissingAuthorisationHeader);
        
        let authProps : any;
        try
        {
            authProps = parseHTTPAuthHeader(authHeader, 'Digest');
        }
        catch(ex)
        {
            return onError(Errors.WrongHeaderFormat);
        }
        
        if(!(authProps.username && authProps.nonce && authProps.response))
            return onError(Errors.AuenticationPropertyMissing);
        if(!authProps.algorithm)
            authProps.algorithm = 'MD5';
        
        userManager.getUserByName(authProps.username, (e, user) => {
            if(e)
                return onError(e);
        
            let ha1 = md5(authProps.username + ':' + this.realm + ':' + (user.password ? user.password : ''));
            if(authProps.algorithm === 'MD5-sess')
                ha1 = md5(ha1 + ':' + authProps.nonce + ':' + authProps.cnonce);

            let ha2;
            if(authProps.qop === 'auth-int')
                return onError(Errors.WrongHeaderFormat); // ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + ctx.requested.uri + ':' + md5(...));
            else
                ha2 = md5(arg.request.method.toString().toUpperCase() + ':' + arg.uri);

            let result;
            if(authProps.qop === 'auth-int' || authProps.qop === 'auth')
                result = md5(ha1 + ':' + authProps.nonce + ':' + authProps.nc + ':' + authProps.cnonce + ':' + authProps.qop + ':' + ha2);
            else
                result = md5(ha1 + ':' + authProps.nonce + ':' + ha2);

            if(result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors.None, user);
            else
                onError(Errors.BadAuthentication);
        });
    }
}
