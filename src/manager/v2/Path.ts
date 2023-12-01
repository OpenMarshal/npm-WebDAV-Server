
export class Path
{
    paths : string[]

    static isPath(obj : any) : boolean
    {
        return typeof obj === 'string' || obj && obj.constructor === Path;
    }

    constructor(path : Path | string[] | string)
    {
        if(typeof path === "string")
        {
            let sPath = path;
            let doubleIndex : number;
            while((doubleIndex = sPath.indexOf('//')) !== -1)
                sPath = sPath.slice(0, doubleIndex) + sPath.slice(doubleIndex + 1);
            this.paths = sPath.replace(/(^\/|\/$)/g, '').split('/');
        }
        else if(Array.isArray(path))
            this.paths = path;
        else
            this.paths = path.paths.slice(0); // clone
        
        this.paths = this.paths.filter((p) => p.length > 0);
    }

    decode() : void
    {
        this.paths = this.paths.map(decodeURIComponent);
    }

    isRoot() : boolean
    {
        return this.paths.length === 0 || this.paths.length === 1 && this.paths[0].length === 0;
    }

    fileName() : string
    {
        return this.paths[this.paths.length - 1];
    }

    rootName() : string
    {
        return this.paths[0];
    }

    parentName() : string
    {
        return this.paths[this.paths.length - 2];
    }

    getParent() : Path
    {
        return new Path(this.paths.slice(0, this.paths.length - 1));
    }

    hasParent() : boolean
    {
        return this.paths.length >= 2;
    }

    removeRoot() : string
    {
        return this.paths.shift();
    }
    
    removeFile() : string
    {
        return this.paths.pop();
    }

    getChildPath(childPath : string | Path) : Path
    {
        const subPath = new Path(childPath);

        const path = this.clone();
        for(const subName of subPath.paths)
            path.paths.push(subName);
        return path;
    }

    clone() : Path
    {
        return new Path(this);
    }

    toString(endsWithSlash : boolean = false) : string
    {
        const value = '/' + this.paths.join('/');
        if(endsWithSlash && value.length > 1)
            return value + '/';
        return value;
    }
}
