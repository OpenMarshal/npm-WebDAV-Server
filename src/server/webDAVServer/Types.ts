import { HTTPCodes, MethodCallArgs, WebDAVRequest, ChunkOnDataCallback } from '../WebDAVRequest'
import { WebDAVServerOptions, setDefaultServerOptions } from '../WebDAVServerOptions'
import { SerializedObject, unserialize, serialize } from '../../manager/ISerializer'
import { IResource, ReturnCallback } from '../../resource/IResource'
import { FakePrivilegeManager } from '../../user/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../../user/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../../user/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../../user/simple/SimpleUserManager'
import { FSManager, FSPath } from '../../manager/FSManager'
import { Errors, HTTPError } from '../../Errors'
import { RootResource } from '../../resource/std/RootResource'
import { IUserManager } from '../../user/IUserManager'
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
