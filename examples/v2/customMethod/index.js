const webdav = require('webdav-server').v2;

// Server instantiation
const server = new webdav.WebDAVServer();

server.method('TRACE', {
    unchunked(wctx, data, next)
    {
        const path = wctx.requested.path.toString(true);
        const nbPaths = wctx.requested.path.paths.length;
        const method = wctx.headers.find('trace-method', '*').toLowerCase();
        const separator = wctx.headers.find('trace-separator', '\r\n');
        const iDepth = parseInt(wctx.headers.find('trace-depth', 'infinity').toLowerCase());
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

server.start((s) => console.log('Ready on port', s.address().port));
