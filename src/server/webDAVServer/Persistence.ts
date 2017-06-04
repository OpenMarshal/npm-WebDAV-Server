import { SerializedObject, unserialize, serialize } from '../../manager/ISerializer'
import { FSManager } from '../../manager/FSManager'

export function load(obj : SerializedObject, managers : FSManager[], callback: (error : Error) => void)
{
    unserialize(obj, managers, (e, r) => {
        if(!e)
        {
            this.rootResource = r;
            callback(null);
        }
        else
            callback(e);
    })
}

export function save(callback : (error : Error, obj : any) => void)
{
    serialize(this.rootResource, callback);
}
