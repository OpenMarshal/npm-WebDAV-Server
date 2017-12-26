import { HTTPAuthentication } from './HTTPAuthentication';
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { IUserManager } from '../IUserManager';
import { IUser } from '../IUser';
export declare class HTTPDigestAuthentication implements HTTPAuthentication {
    realm: string;
    nonceSize: number;
    constructor(realm?: string, nonceSize?: number);
    generateNonce(): string;
    askForAuthentication(): {
        'WWW-Authenticate': string;
    };
    getUser(arg: MethodCallArgs, userManager: IUserManager, callback: (error: Error, user: IUser) => void): void;
}
