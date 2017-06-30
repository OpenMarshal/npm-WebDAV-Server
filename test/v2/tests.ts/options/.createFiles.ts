import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, name : string, expect : string[], reject : string[], callback : (allowHeader ?: string[]) => void) : void
{
    server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
        'folder': v2.ResourceType.Directory,
        'file': v2.ResourceType.File,
        'hybrid': v2.ResourceType.Hybrid,
        'noResource': v2.ResourceType.NoResource,
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        info.req({
            url: 'http://localhost:' + server.options.port + '/' + name,
            method: 'OPTIONS'
        }, v2.HTTPCodes.OK, (req) => {
            if(!req.headers.allow)
                return isValid(false, 'No "Allow" header returned in the response of the OPTIONS, but expected one.', JSON.stringify(req.headers, null, 4));
            
            const allow = req.headers.allow.split(',').map((s) => s.trim().toLowerCase());
            reject = reject.map((s) => s.trim().toLowerCase());
            expect = expect.map((s) => s.trim().toLowerCase());
            
            const rejected = reject.filter((r) => allow.some((a) => a === r));
            if(rejected.length > 0)
                return isValid(false, 'Forbidden methods for resource present in the "Allow" header in the response.', rejected.toString());

            const expected = expect.filter((r) => !allow.some((a) => a === r));
            if(expected.length > 0)
                return isValid(false, 'All expected methods are not present in the "Allow" header in the response.', expected.toString());
            
            callback(allow);
        })
    })
}
