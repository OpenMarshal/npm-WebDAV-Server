import { v2 as webdav } from 'webdav-server'
import * as request from 'request'

// Server instantiation
const server = new webdav.WebDAVServer();

const folderNotify = { };
server.method('TRACE', {
    unchunked(ctx : webdav.HTTPRequestContext, data : Buffer, cb : () => void)
    {
        if(!ctx.user)
        {
            ctx.setCode(webdav.HTTPCodes.Unauthorized);
            return cb();
        }

        const path = ctx.requested.path.toString(true);
        const name = ctx.user.username;
        let lastCheck = 0;
        if(!folderNotify[name])
            folderNotify[name] = {};
        if(folderNotify[name][path])
            lastCheck = folderNotify[name][path];
        
        const list = [];
        
        ctx.getResource((e, r) => {
            r.readDir((e, files) => {
                let nb = files.length + 1;
                const go = () => {
                    if(--nb === 0)
                    {
                        ctx.setCode(webdav.HTTPCodes.OK);
                        ctx.response.write(JSON.stringify(list));
                        folderNotify[name][path] = Date.now();
                        cb();
                    }
                }
                go();
                
                files.forEach((file) => {
                    r.fs.lastModifiedDate(ctx, r.path.toString(true) + file, (e, date) => {
                        if(date >= lastCheck)
                            list.push({
                                path: path + file,
                                name: file
                            });
                        
                        go();
                    })
                })
            })
        })
    }
});

server.start((s) => console.log('Ready on port', s.address().port));
