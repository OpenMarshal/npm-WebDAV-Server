import * as path from 'path'
import * as fs from 'fs'

let pkg : any = undefined;

export function getPackageData(callback : (e : Error, data ?: any) => void)
{
    if(pkg)
    {
        callback(undefined, pkg);
        return;
    }

    const packagePath = path.resolve(path.join(__dirname, '..', '..', '..', 'package.json'));

    fs.readFile(packagePath, (e, data) => {
        try
        {
            if(e)
                throw e;
            
            if(data)
            {
                pkg = JSON.parse(data.toString());

                callback(undefined, pkg);
            }
        }
        catch(ex)
        {
            callback(ex);
        }
    })
}
