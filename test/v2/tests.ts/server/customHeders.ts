import { Test } from '../Type'
import * as request from 'request'

export default ((info, isValid) =>
{
    const server = info.init(1, {
        headers: {
            test: 'ok!!',
            test2: 'ok 2',
            'Test-Array': [ 'ok1', 'ok2' ]
        }
    } as any);

    request({
        url: `http://localhost:${info.port}/`,
        method: 'PROPFIND'
    }, (e, res, body) => {
        isValid(!e && res.headers['test'] === 'ok!!' && res.headers['test2'] === 'ok 2' && res.headers['test-array'] === 'ok1, ok2', 'Headers from server options are not provided correclty');
    });
}) as Test;
