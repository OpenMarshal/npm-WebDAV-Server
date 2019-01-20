import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as crypto from 'crypto'

export default (async (info, isValid) =>
{
    const validUser = {
        username : 'test 1',
        password: 'password test 1'
    };
    const invalidUser = {
        username : 'test 2',
        password: validUser.password
    };

    const fileContent = 'Hello!';

    const createTree = async (server) => {
        return new Promise((resolve, reject) => {
            const userManager = new v2.SimpleUserManager();
            const user = userManager.addUser(validUser.username, validUser.password, false);

            server.httpAuthentication = new v2.HTTPDigestAuthentication(userManager);
            server.privilegeManager = new v2.SimplePathPrivilegeManager();
            server.options.privilegeManager = server.privilegeManager;
            server.privilegeManager.setRights(user, '/', [ 'all' ]);

            server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
                'folder1': {
                    'emptyFolder2': v2.ResourceType.Directory,
                    'file2': fileContent
                },
                'file1': fileContent
            }, (e) => {
                if(e)
                    reject(e);
                else
                    resolve();
            })
        })
    }

    const checkRequest = async (server, userInfo : { username : string, password : string, realm ?: string, uri ?: string }, path, httpCode) => {
        return new Promise((resolve, reject) => {
            const md5 = (data) => {
                return crypto.createHash('md5').update(data).digest('hex');
            }

            userInfo = JSON.parse(JSON.stringify(userInfo));
            userInfo.uri = userInfo.uri || path;
            userInfo.realm = userInfo.realm || 'realm';

            const ha1 = md5(`${userInfo.username}:${userInfo.realm}:${userInfo.password}`);
            const ha2 = md5(`PROPFIND:${userInfo.uri}`);
            const nonce = 'dcd98b7102dd2f0e8b11d0f600bfb0c093';
            const response = md5(`${ha1}:${nonce}:00000001:0a4f113b:auth:${ha2}`);

            info.req({
                url: 'http://localhost:' + server.options.port + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0,
                    Authorization: `Digest username="${userInfo.username}", realm="${userInfo.realm}", nonce="${nonce}", uri="${userInfo.uri}", qop=auth, nc=00000001, cnonce="0a4f113b", response="${response}", opaque="5ccc069c403ebaf9f0171e9517f40e41"`
                }
            }, httpCode, () => {
                resolve();
            })
        })
    }

    const server = info.init(1);

    await createTree(server);

    await checkRequest(server, {
        username: validUser.username,
        password: validUser.password
    }, '/', v2.HTTPCodes.MultiStatus);
    
    await checkRequest(server, {
        username: validUser.username,
        password: validUser.password
    }, '/folder1', v2.HTTPCodes.MultiStatus);

    await checkRequest(server, {
        username: validUser.username,
        password: validUser.password
    }, '/folder1/', v2.HTTPCodes.MultiStatus);
    
    await checkRequest(server, {
        username: validUser.username,
        password: validUser.password,
        uri: '/folder1/'
    }, '/folder1', v2.HTTPCodes.MultiStatus);

    await checkRequest(server, {
        username: validUser.username,
        password: validUser.password,
        uri: '/folder1'
    }, '/folder1/', v2.HTTPCodes.MultiStatus);

    await checkRequest(server, {
        username: invalidUser.username,
        password: invalidUser.password
    }, '/', v2.HTTPCodes.Unauthorized);
    
    await checkRequest(server, {
        username: invalidUser.username,
        password: invalidUser.password
    }, '/folder1', v2.HTTPCodes.Unauthorized);

    await checkRequest(server, {
        username: invalidUser.username,
        password: invalidUser.password
    }, '/folder1/', v2.HTTPCodes.Unauthorized);
    
    await checkRequest(server, {
        username: invalidUser.username,
        password: invalidUser.password,
        uri: '/folder1/'
    }, '/folder1', v2.HTTPCodes.Unauthorized);

    await checkRequest(server, {
        username: invalidUser.username,
        password: invalidUser.password,
        uri: '/folder1'
    }, '/folder1/', v2.HTTPCodes.Unauthorized);

    isValid(true);

}) as Test;
