import { ResourceTreeNode } from './Types';
import { IResource, ReturnCallback } from '../../../resource/v1/IResource';
import { MethodCallArgs } from '../MethodCallArgs';
import { FSPath } from '../../../manager/v1/FSManager';
export declare function getResourceFromPath(arg: MethodCallArgs, path: FSPath | string[] | string, callbackOrRootResource: ReturnCallback<IResource> | IResource, callback?: ReturnCallback<IResource>): void;
export declare function addResourceTree(_rootResource: IResource | ResourceTreeNode, _resoureceTree: ResourceTreeNode | (() => void), _callback?: (e: Error) => void): void;
