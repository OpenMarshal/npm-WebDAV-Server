import { Resource, Path } from '../../../manager/v2/export'
import { Workflow } from '../../../helper/Workflow'

export type PrivilegeManagerCallback = (error : Error, hasAccess : boolean) => void;
export type PrivilegeManagerMethod = (fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) => void

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

function checkAll(pm : PrivilegeManager, fns : PrivilegeManagerMethod[], fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback)
{
    new Workflow()
        .each(fns, (fn, cb) => fn.bind(pm)(fullPath, resource, cb))
        .error((e) => callback(e, false))
        .done((successes) => callback(null, successes.every((b) => !!b)))
}

export class PrivilegeManager
{
    can(fullPath : Path | string, resource : Resource, privilege : BasicPrivilege, callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : string, callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : BasicPrivilege[], callback : PrivilegeManagerCallback) : void
    can(fullPath : Path | string, resource : Resource, privilege : string[], callback : PrivilegeManagerCallback) : void
    can(_fullPath : Path | string, resource : Resource, _privilege : BasicPrivilege | string | BasicPrivilege[] | string[], callback : PrivilegeManagerCallback) : void
    {
        if(_privilege.constructor !== String)
        {
            new Workflow()
                .each(_privilege as string[], (privilege, cb) => this.can(_fullPath, resource, privilege, cb))
                .error((e) => callback(e, false))
                .done((checks) => callback(null, checks.every((b) => !!b)));
            return;
        }

        const fullPath = new Path(_fullPath);
        const privilege = _privilege as string;

        if(this._can)
            return this._can(fullPath, resource, privilege, callback);
        
        const method : PrivilegeManagerMethod = this[privilege];
        if(method)
            method.bind(this)(fullPath, resource, callback);
        else
            callback(null, true);
    }
    protected _can?(fullPath : Path, resource : Resource, privilege : string, callback : PrivilegeManagerCallback) : void

    protected canWrite(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canWriteLocks,
            this.canWriteContent,
            this.canWriteProperties
        ], fullPath, resource, callback);
    }
    
    protected canWriteLocks(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteContent(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canWriteContentSource,
            this.canWriteContentTranslated
        ], fullPath, resource, callback);
    }
    
    protected canWriteContentTranslated(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteContentSource(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canWriteProperties(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canRead(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canReadLocks,
            this.canReadContent,
            this.canReadProperties
        ], fullPath, resource, callback);
    }
    
    protected canReadLocks(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadContent(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        checkAll(this, [
            this.canReadContentSource,
            this.canReadContentTranslated
        ], fullPath, resource, callback);
    }
    
    protected canReadContentTranslated(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadContentSource(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
    
    protected canReadProperties(fullPath : Path, resource : Resource, callback : PrivilegeManagerCallback) : void
    {
        callback(null, true);
    }
}
