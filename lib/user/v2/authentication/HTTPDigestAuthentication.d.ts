import { HTTPAuthentication } from './HTTPAuthentication';
import { RequestContext } from '../../../server/v2/RequestContext';
import { IListUserManager } from '../userManager/IListUserManager';
import { IUser } from '../IUser';
export declare class HTTPDigestAuthentication implements HTTPAuthentication {
    userManager: IListUserManager;
    realm: string;
    nonceSize: number;
    constructor(userManager: IListUserManager, realm?: string, nonceSize?: number);
    generateNonce(): string;
    askForAuthentication(): {
        'WWW-Authenticate': string;
    };
    getUser(arg: RequestContext, callback: (error: Error, user: IUser) => void): void;
}
