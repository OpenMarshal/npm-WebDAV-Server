import { Resource, Path } from '../../../manager/v2/export'
import { Workflow } from '../../../helper/Workflow'
import { IUser } from '../IUser'
import Errors from '../../../Errors';
import { SimpleUserValidator } from './SimpleUserValidator';
import { IUserValidator } from './IUserValidator';

export type PrivilegeManagerCallback = (error : Error, hasAccess : boolean) => void;
export type PrivilegeManagerMethod = (fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) => void

export type BasicPrivilege = 
      'canWrite'
        | 'canWriteLocks'
        | 'canWriteContent'
            | 'canWriteContentTranslated'
            | 'canWriteContentSource'
        | 'canWriteProperties'
    | 'canRead'
        | 'canReadLocks'
        | 'canReadContent'
            | 'canReadContentTranslated'
            | 'canReadContentSource'
        | 'canReadProperties'

function checkAll(pm : PrivilegeManager, fns : PrivilegeManagerMethod[], fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback)
{
    new Workflow()
        .each(fns, (fn, cb) => fn.bind(pm)(fullPath, user, resource, cb))
        .error((e) => callback(e, false))
        .done((successes) => callback(null, successes.every((b) => !!b)))
}

export class PrivilegeManager
{
    private _userValidator: IUserValidator = new SimpleUserValidator();

    protected get userValidator()
    {
        return this._userValidator;
    }
    protected set userValidator(userValidator: IUserValidator)
    {
        if(!userValidator) {
            throw Errors.IllegalArguments;
        }

        this._userValidator = userValidator;
    }

    canAsync(fullPath: Path | string, resource: Resource, privilege: BasicPrivilege): Promise<boolean>
    canAsync(fullPath: Path | string, resource: Resource, privilege: string): Promise<boolean>
    canAsync(fullPath: Path | string, resource: Resource, privilege: BasicPrivilege[]): Promise<boolean>
    canAsync(fullPath: Path | string, resource: Resource, privilege: string[]): Promise<boolean>
    canAsync(_fullPath : Path | string, resource : Resource, _privilege : BasicPrivilege | string | BasicPrivilege[] | string[]): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            this.can(_fullPath, resource, _privilege as any, (e, hasAccess) => {
                if(e) {
                    reject(e);
                } else {
                    resolve(hasAccess);
                }
            });
        });
    }

    can(fullPath : Path | string, resource : Resource, privilege : BasicPrivilege, callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : string, callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : BasicPrivilege[], callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : string[], callback : PrivilegeManagerCallback) : void
    can(_fullPath : Path | string, resource : Resource, _privilege : BasicPrivilege | string | BasicPrivilege[] | string[], callback : PrivilegeManagerCallback) : void
    {
        if(!resource || !resource.context)
            return callback(Errors.IllegalArguments, false);

        const user = resource.context.user;
        const isUserValid = this.userValidator.isUserValid(user);
        if(resource.context.overridePrivileges || isUserValid && user.isAdministrator)
            return callback(null, true);
        if(!isUserValid)
            return callback(Errors.IllegalArguments, false);
        
        if(Array.isArray(_privilege))
        {
            new Workflow()
                .each(_privilege as string[], (privilege, cb) => this.can(_fullPath, resource, privilege, cb))
                .error((e) => callback(e, false))
                .done((checks) => callback(null, checks.every((b) => !!b)));
            return;
        }

        const fullPath = new Path(_fullPath);
        const resolveError = fullPath.resolve();
        if(resolveError)
        {
            return callback(resolveError, false);
        }

        const privilege = _privilege as string;

        if(this._can)
            return this._can(fullPath, user, resource, privilege, callback);
        
        const method : PrivilegeManagerMethod = this[privilege];
        if(method)
            method.bind(this)(fullPath, user, resource, callback);
        else
            callback(null, true);
    }
    protected _can?(fullPath : Path, user : IUser, resource : Resource, privilege : string, callback : PrivilegeManagerCallback) : void

    protected canWrite(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canWriteLocks,
            this.canWriteContent,
            this.canWriteProperties
        ], fullPath, user, resource, callback);
    }
    
    protected canWriteLocks(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteContent(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canWriteContentSource,
            this.canWriteContentTranslated
        ], fullPath, user, resource, callback);
    }
    
    protected canWriteContentTranslated(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteContentSource(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteProperties(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canRead(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canReadLocks,
            this.canReadContent,
            this.canReadProperties
        ], fullPath, user, resource, callback);
    }
    
    protected canReadLocks(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadContent(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canReadContentSource,
            this.canReadContentTranslated
        ], fullPath, user, resource, callback);
    }
    
    protected canReadContentTranslated(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadContentSource(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadProperties(fullPath : Path, user : IUser, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
}
