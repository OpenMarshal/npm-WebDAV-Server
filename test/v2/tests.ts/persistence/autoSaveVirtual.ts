import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createPersistenceContext'
import * as fs from 'fs'

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
                fs.exists(file, (exists) => {
                    isValid(exists, 'The save file is not created.');
                })
            }, 1000);
        })
    })
    
}) as Test;
