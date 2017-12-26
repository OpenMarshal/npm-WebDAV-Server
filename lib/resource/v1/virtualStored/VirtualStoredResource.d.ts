import { IResource } from '../IResource';
import { FSManager } from '../../../manager/v1/FSManager';
import { VirtualResource } from '../virtual/VirtualResource';
export declare abstract class VirtualStoredResource extends VirtualResource {
    constructor(name: string, parent?: IResource, fsManager?: FSManager);
}
