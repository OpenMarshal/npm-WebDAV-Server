import { ResourceTreeNode } from './Types';
import { IResource, ReturnCallback } from '../../resource/IResource';
import { FSPath } from '../../manager/FSManager';
export declare function getResourceFromPath(path: FSPath | string[] | string, callbackOrRootResource: ReturnCallback<IResource> | IResource, callback?: ReturnCallback<IResource>): void;
export declare function addResourceTree(_rootResource: IResource | ResourceTreeNode, _resoureceTree: ResourceTreeNode | (() => void), _callback?: (e: Error) => void): void;
