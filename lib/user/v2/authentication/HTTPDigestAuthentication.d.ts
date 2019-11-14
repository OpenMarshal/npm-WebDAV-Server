import { HTTPAuthentication } from './HTTPAuthentication';
import { HTTPRequestContext } from '../../../server/v2/RequestContext';
import { IListUserManager } from '../userManager/IListUserManager';
import { IUser } from '../IUser';
export declare class HTTPDigestAuthentication implements HTTPAuthentication {
    userManager: IListUserManager;
    realm: string;
    nonceSize: number;
    constructor(userManager: IListUserManager, realm?: string, nonceSize?: number);
    generateNonce(): string;
    askForAuthentication(ctx: HTTPRequestContext): {
        'WWW-Authenticate': string;
    };
    getUser(ctx: HTTPRequestContext, callback: (error: Error, user: IUser) => void): void;
}
