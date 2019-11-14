
export function promisifyCall<T>(call : (cb : (error ?: any, result ?: T) => void) => void) : Promise<T>
export function promisifyCall<T>(call : (cb : (error ?: any) => void) => void) : Promise<void>
export function promisifyCall<T>(call : (cb : (error ?: any, result ?: T) => void) => void) : Promise<T>
{
    return new Promise<any>((resolve, reject) => {
        call((e, result) => {
            if(e)
                reject(e);
            else
                resolve(result);
        });
    })
}

export function ensureValue<T>(variable : T, value : T) : T
{
    if(variable === null || variable === undefined)
    {
        return value;
    }
    else
    {
        return variable;
    }
}
