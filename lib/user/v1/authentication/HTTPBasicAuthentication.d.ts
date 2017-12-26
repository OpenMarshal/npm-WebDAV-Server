import { HTTPAuthentication } from './HTTPAuthentication';
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { IUserManager } from '../IUserManager';
import { IUser } from '../IUser';
export declare class HTTPBasicAuthentication implements HTTPAuthentication {
    realm: string;
    constructor(realm?: string);
    askForAuthentication(): {
        'WWW-Authenticate': string;
    };
    getUser(arg: MethodCallArgs, userManager: IUserManager, callback: (error: Error, user: IUser) => void): void;
}
