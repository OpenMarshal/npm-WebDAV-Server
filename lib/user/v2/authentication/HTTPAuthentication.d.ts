import { RequestContext } from '../../../server/v2/RequestContext';
import { IUser } from '../IUser';
export interface HTTPAuthentication {
    askForAuthentication(): {
        [headeName: string]: string;
    };
    getUser(arg: RequestContext, callback: (error: Error, user?: IUser) => void): void;
}
