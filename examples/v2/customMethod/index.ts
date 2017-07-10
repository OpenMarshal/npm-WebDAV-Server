import { v2 as webdav } from 'webdav-server'
import * as request from 'request'

// Server instantiation
const server = new webdav.WebDAVServer();

server.method('TRACE', {
    unchunked(wctx : webdav.HTTPRequestContext, data : Buffer, next : () => void)
    {
        const path = wctx.requested.path.toString(true);
        const nbPaths = wctx.requested.path.paths.length;
        const method = wctx.headers.find('trace-method', '*').toLowerCase();
        const separator = wctx.headers.find('trace-separator', '\r\n');
        const iDepth = parseInt(wctx.headers.find('trace-depth', 'infinity').toLowerCase(), 10);
        const depth = isNaN(iDepth) ? -1 : iDepth;
        wctx.setCode(webdav.HTTPCodes.OK);

        server.afterRequest((ctx, next) => {
            const ctxMethod = ctx.request.method.toLowerCase();
            const ctxPath = ctx.requested.path;
            const sCtxPath = ctxPath.toString(true);

            if((method === '*' || ctxMethod === method) && ((depth === -1 || ctxPath.paths.length <= depth + nbPaths) && sCtxPath.indexOf(path) === 0))
            {
                wctx.response.write(JSON.stringify({
                    request: {
                        method: ctxMethod,
                        path: ctxPath.toString()
                    },
                    response: {
                        status: {
                            code: ctx.response.statusCode,
                            message: ctx.response.statusMessage
                        }
                    }
                }));
                wctx.response.write(separator);
            }
            next();
        })
    }
})

server.start((s) => {
    const port = s.address().port;
    console.log('Ready on port', port);
    
    let buffer = '';
    const stream = request({
        url: 'http://localhost:' + port + '/',
        method: 'TRACE'
    })
    stream.on('data', (data : string | Buffer) => {
        buffer += data.toString();

        while(true)
        {
            const index = buffer.indexOf('\r\n');
            if(index === -1)
                break;
            
            const json = JSON.parse(buffer.substring(0, index));
            buffer = buffer.substring(index + 2);
            
            const prefix = json.response.status.code < 300 ? 'o' : 'x';
            console.log(' [' + prefix + '] ' + json.request.method + ' ' + json.request.path + ' |> ' + json.response.status.code + ' ' + json.response.status.message);
        }
    })
    stream.end();
});
