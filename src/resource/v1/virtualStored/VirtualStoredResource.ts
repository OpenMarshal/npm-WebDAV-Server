import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { Readable, ReadableOptions } from 'stream'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { VirtualResource } from '../virtual/VirtualResource'

export abstract class VirtualStoredResource extends VirtualResource
{
    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        if(!fsManager)
            if(parent && parent.fsManager && (parent.fsManager.constructor as any).name === 'VirtualStoredFSManager')
                fsManager = parent.fsManager;
            else
                throw new Error('Cannot create a default FSManager for this resource')

        super(name, parent, fsManager);
    }
}
