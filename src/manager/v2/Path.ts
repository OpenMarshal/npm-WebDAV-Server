
export class Path
{
    paths : string[]

    static isPath(obj : any) : boolean
    {
        return typeof obj === 'string' || obj && obj.constructor === Path;
    }

    constructor(path : Path | string[] | string)
    {
        if(path.constructor === String)
        {
            let sPath = path as string;
            let doubleIndex : number;
            while((doubleIndex = sPath.indexOf('//')) !== -1)
                sPath = sPath.substr(0, doubleIndex) + sPath.substr(doubleIndex + 1);
            this.paths = sPath.replace(/(^\/|\/$)/g, '').split('/');
        }
        else if(path.constructor === Path)
            this.paths = (path as Path).paths.filter((x) => true); // clone
        else
            this.paths = path as string[];
        
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
