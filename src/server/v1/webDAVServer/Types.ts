import { WebDAVServerOptions, setDefaultServerOptions } from '../WebDAVServerOptions'
import { SerializedObject, unserialize, serialize } from '../../../manager/v1/ISerializer'
import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ReturnCallback } from '../../../resource/v1/IResource'
import { FakePrivilegeManager } from '../../../user/v1/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../../../user/v1/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../../../user/v1/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../../../user/v1/simple/SimpleUserManager'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { Errors, HTTPError } from '../../../Errors'
import { RootResource } from '../../../resource/v1/std/RootResource'
import { IUserManager } from '../../../user/v1/IUserManager'
import Commands from '../commands/Commands'
import * as http from 'http'

export type WebDAVServerStartCallback = (server ?: http.Server) => void;

export interface IResourceTreeNode
{
    r ?: IResource
    resource ?: IResource
    c ?: ResourceTreeNode[]
    children ?: ResourceTreeNode[]
}
export type ResourceTreeNode = IResourceTreeNode | IResource | IResourceTreeNode[] | IResource[];
