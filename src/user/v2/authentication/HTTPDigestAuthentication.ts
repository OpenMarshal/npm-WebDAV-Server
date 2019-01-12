import { md5, parseHTTPAuthHeader } from '../../CommonFunctions'
import { HTTPAuthentication } from './HTTPAuthentication'
import { HTTPRequestContext } from '../../../server/v2/RequestContext'
import { IListUserManager } from '../userManager/IListUserManager'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'

export class HTTPDigestAuthentication implements HTTPAuthentication
{
    constructor(public userManager : IListUserManager, public realm : string = 'realm', public nonceSize : number = 50)
    { }

    generateNonce() : string
    {
        const buffer = new Buffer(this.nonceSize);
        for(let i = 0; i < buffer.length; ++i)
            buffer[i] = Math.ceil(Math.random() * 256);

        return md5(buffer);
    }

    askForAuthentication()
    {
        return {
            'WWW-Authenticate': `Digest realm="${this.realm}", qop="auth", nonce="${this.generateNonce()}", opaque="${this.generateNonce()}"`
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
        
        this.userManager.getUserByName(authProps.username, (e, user) => {
            if(e)
                return onError(e);
        
            let ha1 = md5(`${authProps.username}:${this.realm}:${user.password ? user.password : ''}`);
            if(authProps.algorithm === 'MD5-sess')
                ha1 = md5(`${ha1}:${authProps.nonce}:${authProps.cnonce}`);

            let digestUri = ctx.requested.uri;
            // work around issue with OSX Finder and Mountainduck mounting /directory/ versus /directory
            if (digestUri !== authProps.uri && digestUri.length + 1 === authProps.uri.length && authProps.uri[digestUri.length] === '/' && authProps.uri.indexOf(digestUri) === 0)
                digestUri = authProps.uri;

            let ha2;
            if(authProps.qop === 'auth-int')
                return onError(Errors.WrongHeaderFormat); // ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + digestUri + ':' + md5(...));
            else
                ha2 = md5(`${ctx.request.method.toString().toUpperCase()}:${digestUri}`);

            let result;
            if(authProps.qop === 'auth-int' || authProps.qop === 'auth')
                result = md5(`${ha1}:${authProps.nonce}:${authProps.nc}:${authProps.cnonce}:${authProps.qop}:${ha2}`);
            else
                result = md5(`${ha1}:${authProps.nonce}:${ha2}`);

            if(result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors.None, user);
            else
                onError(Errors.BadAuthentication);
        });
    }
}
