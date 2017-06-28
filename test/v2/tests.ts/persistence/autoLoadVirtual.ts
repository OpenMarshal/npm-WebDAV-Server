import { Test, TestCallback } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createPersistenceContext'
import * as fs from 'fs'

function prob(server : v2.WebDAVServer, isValid : TestCallback, path : string | v2.Path, expectedType : v2.ResourceType, callback : () => void) : void
{
    const ctx = server.createExternalContext();
    server.getResource(ctx, path, (e, r) => {
        if(e)
            return isValid(false, 'Could not find the resource ' + path, e);
        
        r.type((e, type) => {
            if(e)
                return isValid(false, 'Error with the resource ' + path, e);
            if(type !== expectedType)
                return isValid(false, 'Wrong type for the resource ' + path);
            
            callback();
        })
    })
}

export default ((info, isValid) =>
{
    info.init(1);
    
    starter(info, isValid, (server, folder, file, fileTmp) => {
        info.req({
            url: 'http://localhost:' + server.options.port + '/file1',
            method: 'PUT',
            body: 'This is my content!'
        }, () => {
            setTimeout(() => {
                const server2 = info.startServer(server.options);
                server2.autoLoad((e) => {
                    isValid(!e, 'Could not autoLoad the supposed saved server state.', e);

                    prob(server2, isValid, '/folder1', v2.ResourceType.Directory, () => {
                    prob(server2, isValid, '/folder1/emptyFolder2', v2.ResourceType.Directory, () => {
                    prob(server2, isValid, '/folder1/file2', v2.ResourceType.File, () => {
                    prob(server2, isValid, '/folder1/folder2', v2.ResourceType.Directory, () => {
                    prob(server2, isValid, '/folder1/folder2/emptyFolder3', v2.ResourceType.Directory, () => {
                    prob(server2, isValid, '/folder1/folder2/file3', v2.ResourceType.File, () => {
                    prob(server2, isValid, '/emptyFolder1', v2.ResourceType.Directory, () => {
                    prob(server2, isValid, '/file1', v2.ResourceType.File, () => {
                        isValid(true);
                    })
                    })
                    })
                    })
                    })
                    })
                    })
                    })
                })
            }, 1000);
        })
    })

}) as Test;
