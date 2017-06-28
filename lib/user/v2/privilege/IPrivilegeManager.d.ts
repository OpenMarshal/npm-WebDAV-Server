import { Resource, Path } from '../../../manager/v2/export';
export declare type PrivilegeManagerCallback = (error: Error, hasAccess: boolean) => void;
export declare type PrivilegeManagerMethod = (fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback) => void;
export declare type BasicPrivilege = 'canWrite' | 'canWriteLocks' | 'canWriteContent' | 'canWriteContentTranslated' | 'canWriteContentSource' | 'canWriteProperties' | 'canRead' | 'canReadLocks' | 'canReadContent' | 'canReadContentTranslated' | 'canReadContentSource' | 'canReadProperties';
export declare class PrivilegeManager {
    can(fullPath: Path | string, resource: Resource, privilege: BasicPrivilege, callback: PrivilegeManagerCallback): void;
    can(fullPath: Path | string, resource: Resource, privilege: string, callback: PrivilegeManagerCallback): void;
    can(fullPath: Path | string, resource: Resource, privilege: BasicPrivilege[], callback: PrivilegeManagerCallback): void;
    can(fullPath: Path | string, resource: Resource, privilege: string[], callback: PrivilegeManagerCallback): void;
    protected _can?(fullPath: Path, resource: Resource, privilege: string, callback: PrivilegeManagerCallback): void;
    protected canWrite(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canWriteLocks(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canWriteContent(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canWriteContentTranslated(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canWriteContentSource(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canWriteProperties(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canRead(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canReadLocks(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canReadContent(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canReadContentTranslated(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canReadContentSource(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
    protected canReadProperties(fullPath: Path, resource: Resource, callback: PrivilegeManagerCallback): void;
}
