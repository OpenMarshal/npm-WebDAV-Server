/// <reference types="node" />
import { IResource } from '../../../resource/v1/IResource';
import * as http from 'http';
export declare type WebDAVServerStartCallback = (server?: http.Server) => void;
export interface IResourceTreeNode {
    r?: IResource;
    resource?: IResource;
    c?: ResourceTreeNode[];
    children?: ResourceTreeNode[];
}
export declare type ResourceTreeNode = IResourceTreeNode | IResource | IResourceTreeNode[] | IResource[];
