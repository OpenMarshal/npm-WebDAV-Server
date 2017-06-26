import { HTTPAuthentication } from './HTTPAuthentication';
import { RequestContext } from '../../../server/v2/RequestContext';
import { ITestableUserManager } from '../userManager/ITestableUserManager';
import { IUser } from '../IUser';
export declare class HTTPBasicAuthentication implements HTTPAuthentication {
    userManager: ITestableUserManager;
    realm: string;
    constructor(userManager: ITestableUserManager, realm?: string);
    askForAuthentication(): {
        'WWW-Authenticate': string;
    };
    getUser(arg: RequestContext, callback: (error: Error, user: IUser) => void): void;
}
