import { ITestableUserManager } from '../userManager/ITestableUserManager';
import { HTTPAuthentication } from './HTTPAuthentication';
import { HTTPRequestContext } from '../../../server/v2/RequestContext';
import { IUser } from '../IUser';
export declare class HTTPBasicAuthentication implements HTTPAuthentication {
    userManager: ITestableUserManager;
    realm: string;
    constructor(userManager: ITestableUserManager, realm?: string);
    askForAuthentication(ctx: HTTPRequestContext): {
        'WWW-Authenticate': string;
    };
    getUser(ctx: HTTPRequestContext, callback: (error: Error, user: IUser) => void): void;
}
