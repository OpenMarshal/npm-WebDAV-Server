import { IResource, ResourceType } from '../../resource/v1/IResource'
import { Errors, ManagerNotFound } from '../../Errors'
import { FSManager } from './FSManager'

export class SerializedObject
{
    data : any
    type : ResourceType
    children : SerializedObject[]
    managerUID : string

    constructor(managerUID : string, type : ResourceType)
    {
        this.managerUID = managerUID;
        this.children = [];
        this.type = type;
    }
}

export interface ISerializer
{
    serialize(resource : IResource, obj : SerializedObject) : object;
    unserialize(data : any, obj : SerializedObject) : IResource;
}

export function unserialize(obj : SerializedObject, managers : FSManager[], callback : (error : Error, rootResource : IResource) => void)
{
    for(const m of managers)
        if(m.uid === obj.managerUID)
        {
            const resource = m.unserialize(obj.data, obj);

            if(!obj.children || obj.children.length === 0)
            {
                process.nextTick(() => callback(null, resource));
                return;
            }

            let nb = obj.children.length;
            const go = (e) =>
            {
                if(nb <= 0)
                    return;
                if(e)
                {
                    nb = -1;
                    process.nextTick(() => callback(e, resource));
                    return;
                }
                --nb;
                if(nb === 0)
                    process.nextTick(() => callback(null, resource));
            }

            obj.children.forEach((c) => unserialize(c, managers, (e, r) => {
                if(e)
                    go(e);
                else
                    resource.addChild(r, go);
            }))
            return;
        }
    
    process.nextTick(() => callback(new ManagerNotFound(obj.managerUID), null));
}

export function serialize(resource : IResource, callback : (error : Error, obj : SerializedObject) => void)
{
    resource.type((e, type) => {
        const obj = new SerializedObject(resource.fsManager.uid, type);
        obj.data = resource.fsManager.serialize(resource, obj);
        
        if(obj.data === undefined || obj.data === null)
        {
            callback(null, null);
            return;
        }
        if(!type.isDirectory)
        {
            callback(null, obj);
            return;
        }

        resource.getChildren((e, children) => {
            process.nextTick(() => {
                if(e)
                {
                    callback(e, obj);
                    return;
                }
                if(children.length === 0)
                {
                    callback(null, obj);
                    return;
                }

                let nb = children.length;
                function go(error, subObj)
                {
                    if(nb <= 0)
                        return;
                    if(error)
                    {
                        nb = -1;
                        process.nextTick(() => callback(error, obj));
                        return;
                    }
                    if(subObj)
                        obj.children.push(subObj);
                    --nb;
                    if(nb === 0)
                        process.nextTick(() => callback(null, obj));
                }
                children.forEach((c) => serialize(c, go));
            })
        })
    })
}
