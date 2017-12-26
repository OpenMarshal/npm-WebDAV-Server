import { ResourceTesterTestCallback } from './Types'

// ****************************** Content ****************************** //
export function writeRead(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    if(!this.options.canWrite || !this.options.canRead)
    {
        this.producer(false, (r1) => {
            r1.write(true, (e, w) => {
                callback(e, !e, 'write error', this.options.canWrite);
            })
        })
        return;
    }

    const values = [ 'content1', 'content2' ];
    const value = values.reduce((p, s) => p + s);
    
    const write = (w, cb) =>
    {
        if(values.length === 0)
        {
            cb();
            return;
        }

        w.write(values.shift(), (e) => {
            callback(e, !e, 'write error', this.options.canWrite, () => {
                write(w, cb);
            })
        })
    }

    this.producer(false, (r1) => {
        r1.write(true, (e, w) => {
            callback(e, !e, 'write error', undefined, () => {
                write(w, () => {
                    w.end();
                    r1.read(true, (e, r) => {
                        callback(e, !e, 'read error', undefined, () => {
                            let fdata = '';
                            r.on('data', (data) => {
                                fdata += data.toString();
                            })
                            r.on('end', () => {
                                callback(null, fdata && fdata === value, 'The read value must be the same as the written value');
                            })
                        })
                    })
                })
            });
        }, values.join('').length)
    })
}
export function mimeType(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(false, (r1) => {
        r1.mimeType(true, (e) => {
            callback(e, !e, 'mimeType error', this.options.canGetMimeType);
        })
    })
}
export function size(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    if(!this.options.canWrite || !this.options.canGetSize)
    {
        this.producer(false, (r1) => {
            r1.size(true, (e, size) => {
                callback(e, !e, 'The size method must fail', this.options.canGetSize)
            })
        })
        return;
    }

    const value = 'test';

    this.producer(false, (r1) => {
        r1.write(true, (e, w) => {
            callback(e, !e, 'write error', this.options.canWrite, () => {
                w.end(value, (e) => {
                    callback(e, !e, 'Writable write error', this.options.canWrite, () => {
                        r1.size(true, (e, size) => {
                            callback(e, !e, 'size error', this.options.canGetSize, () => {
                                callback(null, size === value.length, 'The size value provided by the size method is invalid');
                            })
                        })
                    })
                })
            });
        }, value.length)
    })
}
