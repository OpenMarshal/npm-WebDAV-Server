import { Test } from '../Type'
import { v2, ResourceType } from '../../../../lib/index.js'
import * as express from 'express'

export default ((info, isValid) =>
{
    const server = info.init(1, undefined, false);

    const app = express();

    const ctx = server.createExternalContext();
    server.rootFileSystem().addSubTree(ctx, {
        file1: ResourceType.File
    }, () => {
        app.use(v2.extensions.express('/webdav', server));
    
        app.listen(server.options.port, () => {
            info.req({
                url: 'http://localhost:' + info.port + '/webdav/file1',
                headers: {
                    destination: '/webdav/file2'
                },
                method: 'MOVE'
            }, v2.HTTPCodes.Created, () => {
                isValid(true);
            })
        })
    })

}) as Test;
