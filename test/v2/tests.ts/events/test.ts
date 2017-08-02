import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createPersistenceContext'
import * as fs from 'fs'

export default ((info, isValid) =>
{
    info.init(7);
    
    starter(info, isValid, 'create', (server, fs) => {
        fs.create(server.createExternalContext(), '/x', v2.ResourceType.File, (e) => { });
    })
    
    starter(info, isValid, 'copy', (server, fs) => {
        fs.copy(server.createExternalContext(), '/file2', '/file2.copy', (e) => { });
    })
    
    starter(info, isValid, 'delete', (server, fs) => {
        fs.delete(server.createExternalContext(), '/file3', (e) => { });
    })
    
    starter(info, isValid, 'move', (server, fs) => {
        fs.move(server.createExternalContext(), '/file4', '/file4.moved', (e) => { });
    })
    
    starter(info, isValid, 'openReadStream', (server, fs) => {
        fs.openReadStream(server.createExternalContext(), '/file5', (e) => { });
    })
    
    starter(info, isValid, 'openWriteStream', (server, fs) => {
        fs.openWriteStream(server.createExternalContext(), '/file6', (e) => { });
    })
    
    starter(info, isValid, 'rename', (server, fs) => {
        fs.rename(server.createExternalContext(), '/file7', 'file7.rename', (e) => { });
    })
    
}) as Test;
