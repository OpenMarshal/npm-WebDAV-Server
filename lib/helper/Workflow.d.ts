export declare class Workflow {
    counter: number;
    data: any[];
    errorFn: (error?: any) => void;
    doneFn: (data?: any[]) => void;
    intermediateFn: (subject: any, e?: any, data?: any) => void;
    exitOnError: boolean;
    constructor(exitOnError?: boolean);
    protected _done(subject: any, e?: any, data?: any): void;
    each<T>(subjects: T[], fn: (subject: T, done: (error?: any, data?: any) => void) => void): this;
    eachProperties(object: any, fn: (name: string, value: any, done: (error?: any, data?: any) => void) => void): this;
    intermediate(fn: (subject: any, e?: any, data?: any) => void): this;
    error(fn: (error?: any) => void): this;
    done(fn: (data?: any[]) => void): this;
}
