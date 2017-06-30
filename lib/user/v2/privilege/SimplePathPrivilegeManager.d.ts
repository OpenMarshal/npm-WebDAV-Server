import { BasicPrivilege, PrivilegeManager, PrivilegeManagerCallback } from './PrivilegeManager';
import { Resource, Path } from '../../../manager/v2/export';
import { IUser } from '../IUser';
export declare class SimplePathPrivilegeManager extends PrivilegeManager {
    rights: any;
    constructor();
    setRights(user: IUser, path: string, rights: BasicPrivilege[] | string[]): void;
    getRights(user: IUser, path: string): string[];
    _can(fullPath: Path, user: IUser, resource: Resource, privilege: BasicPrivilege | string, callback: PrivilegeManagerCallback): void;
}
