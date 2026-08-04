import Errors from "../../Errors";

export class Path
{
    /**
     * true if the path has been resolved with
     * success in Path.resolve().
     */
    private isSuccessfullyResolved = false;

    paths : string[]

    static isPath(obj : any) : boolean
    {
        return typeof obj === 'string' || obj instanceof Path;
    }

    constructor(path : Path | string[] | string)
    {
        if(path === undefined || path === null)
        {
            this.paths = [];
        }
        else if(typeof path === "string")
        {
            this.paths = (path as string)
                .replace(/[\\\/]+/mg, '/')
                .replace(/(^\/|\/$)/g, '')
                .split('/');
        }
        else if(path instanceof Path)
        {
            this.paths = path.paths.slice();
            this.isSuccessfullyResolved = path.isSuccessfullyResolved;
        }
        else
        {
            this.paths = path.flatMap(e => e
                .replace(/[\\\/]+/mg, '/')
                .split('/')
            );
        }
        
        this.paths = this.paths.filter(Boolean);
    }

    decode() : void
    {
        this.paths = this.paths
            .map(decodeURIComponent)
            .flatMap(e => e
                .replace(/[\\\/]+/mg, '/')
                .split('/')
                .filter(Boolean)
            );
    }

    resolve() : Error
    {
        if(this.isSuccessfullyResolved)
        { // we don't resolve twice to prevent unnecessary work
            return null;
        }

        const newSegments: string[] = [];
        for(const segment of this.paths) {
            if(segment === '..') {
                if(newSegments.length > 0) {
                    newSegments.pop();
                } else {
                    return Errors.IllegalArguments;
                }
            } else if(segment === '.') {
            } else {
                newSegments.push(segment);
            }
        }

        this.paths = newSegments;
        this.isSuccessfullyResolved = true;
        return null;
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
        path.paths.push(...subPath.paths);
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
