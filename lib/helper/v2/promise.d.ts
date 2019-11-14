export declare function promisifyCall<T>(call: (cb: (error?: any, result?: T) => void) => void): Promise<T>;
export declare function promisifyCall<T>(call: (cb: (error?: any) => void) => void): Promise<void>;
export declare function ensureValue<T>(variable: T, value: T): T;
