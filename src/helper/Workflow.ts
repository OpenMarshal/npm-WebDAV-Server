import { IResource, ReturnCallback, ETag } from '../resource/IResource'
import { MethodCallArgs } from '../server/MethodCallArgs'
import { Errors } from '../Errors'
import * as url from 'url'

export class Workflow
{
    counter : number;
    data : any[];
    errorFn : (error ?: any) => void;
    doneFn : (data ?: any[]) => void;
    intermediateFn : (subject : any, e ?: any, data ?: any) => void;

    exitOnError : boolean;

    constructor(exitOnError : boolean = true)
    {
        this.exitOnError = !!exitOnError;
        this.intermediateFn = null;
        this.counter = 0;
        this.data = [];
        this.errorFn = null;
        this.doneFn = null;
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
                this.errorFn(e);
            if(this.exitOnError)
                return;
        }

        if(this.intermediateFn)
            this.intermediateFn(subject, e, data);

        --this.counter;
        this.data.push(data);
        if(this.counter === 0 && this.doneFn)
            this.doneFn(this.data);
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
            for(const name in object)
                fn(name, object[name], (e, d) => this._done({ [name]: object[name] }, e, d));
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

    done(fn : (data ?: any[]) => void)
    {
        this.doneFn = fn;

        if(this.counter === 0)
            process.nextTick(() => this.doneFn(this.data));

        return this;
    }
}
