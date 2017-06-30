import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { methodTesterNotBlocking } from './.createFiles'

export default ((info, isValid) =>
{
    methodTesterNotBlocking(info, isValid, (port, user2, cb) => {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + user2
            }
        }, v2.HTTPCodes.OK, () => {
            cb();
        })
    })

}) as Test;
