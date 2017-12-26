import { Errors } from '../Errors'
import * as url from 'url'

export class Workflow
{
    counter : number;
    data : any[];
    errorFn : (error ?: any) => void;
    doneFn : (data ?: any[]) => void;
    firstFn : (data ?: any[]) => void;
    notFound : () => void;
    intermediateFn : (subject : any, e ?: any, data ?: any) => void;
    started : boolean;

    exitOnError : boolean;

    constructor(exitOnError : boolean = true)
    {
        this.exitOnError = !!exitOnError;
        this.intermediateFn = null;
        this.counter = 0;
        this.data = [];
        this.errorFn = null;
        this.doneFn = null;
        this.started = false;
    }

    protected _done(subject : any, e ?: any, data ?: any)
    {
        if(this.counter <= 0)
            return;
        
        if(e)
        {
            if(this.exitOnError)
                this.counter = -1000;
            if(this.errorFn)
                process.nextTick(() => this.errorFn(e));
            if(this.exitOnError)
            {
                this.started = false;
                return;
            }
        }

        if(this.intermediateFn)
            this.intermediateFn(subject, e, data);

        --this.counter;
        this.data.push(data);

        if(this.counter === 0 && this.doneFn)
        {
            this.started = false;
            process.nextTick(() => this.doneFn(this.data));
        }
        
        if(data && this.firstFn)
        {
            this.counter = -1;
            this.started = false;
            process.nextTick(() => this.firstFn(data));
        }

        if(this.counter === 0 && this.notFound)
        {
            this.started = false;
            process.nextTick(() => this.notFound());
        }
    }

    each<T>(subjects : T[], fn : (subject : T, done : (error ?: any, data ?: any) => void) => void)
    {
        this.counter = subjects.length;
        subjects.forEach((s) => process.nextTick(() => fn(s, (e, d) => this._done(s, e, d))));
        return this;
    }

    eachProperties(object, fn : (name : string, value : any, done : (error ?: any, data ?: any) => void) => void)
    {
        this.counter = Object.keys(object).length;
        process.nextTick(() =>
        {
            this.started = true;
            for(const name in object)
                process.nextTick(() => {
                    if(!this.started)
                        return;
                    fn(name, object[name], (e, d) => this._done({ [name]: object[name] }, e, d));
                });
        })
        return this;
    }

    intermediate(fn : (subject : any, e ?: any, data ?: any) => void)
    {
        this.intermediateFn = fn;
        return this;
    }

    error(fn : (error ?: any) => void)
    {
        this.errorFn = fn;
        return this;
    }

    first(fn : (data ?: any) => void, notFound : () => void)
    {
        this.firstFn = fn;

        if(this.counter === 0)
            process.nextTick(() => this.notFound());

        return this;
    }

    done(fn : (data ?: any[]) => void)
    {
        this.doneFn = fn;

        if(this.counter === 0)
            process.nextTick(() => this.doneFn(this.data));

        return this;
    }
}

export class WorkflowUnique extends Workflow
{
    protected _done(subject : any, e ?: any, data ?: any)
    {
        super._done(subject, e, data);
        const filtered = this.data.filter((d) => !!d);
        if(this.counter !== 0 && filtered.length === 1)
        {
            const _doneFs = this.doneFn;
            this.doneFn = () => {};
            _doneFs.bind(this)(filtered[0]);
        }
    }
}
