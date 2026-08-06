import { IResource } from '../../../resource/v1/IResource'
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
