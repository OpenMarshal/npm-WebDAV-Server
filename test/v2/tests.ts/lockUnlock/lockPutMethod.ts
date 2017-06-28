import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { methodTesterBlocking } from './.createFiles'

export default ((info, isValid) =>
{
    methodTesterBlocking(info, isValid, (port, user1, user2, cb) => {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + user1
            },
            body: 'New content'
        }, v2.HTTPCodes.OK, () => {
            info.req({
                url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
                method: 'PUT',
                headers: {
                    Authorization: 'Basic ' + user2
                },
                body: 'New content'
            }, v2.HTTPCodes.Locked, () => {
                cb();
            })
        })
    }, (port, user2) => {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + user2
            },
            body: 'New content'
        }, v2.HTTPCodes.OK, () => {
            isValid(true);
        })
    })

}) as Test;
