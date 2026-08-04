import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as path from 'path'
import * as fs from 'fs'
import { Headers } from 'request'

export default (async (info, isValid) =>
{
    const validUser = {
        username : 'test 1',
        password: 'password test 1'
    };

    const createEnv = () => {
        return new Promise<void>((resolve) => {
            fs.mkdir(escapeRoot, () => {
            fs.mkdir(physicalFileSystemRoot, () => {
                fs.unlink(path.join(physicalFileSystemRoot, '../fileX'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'fileX'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file1-moved'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file1'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file3-moved'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file3'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file2-spy'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, 'file2'), () => {
                fs.unlink(path.join(physicalFileSystemRoot, '..／file4-moved'), () => {
                fs.unlink(path.join(escapeRoot, 'file-escaped'), () => {
                    fs.writeFile(path.join(physicalFileSystemRoot, 'file1'), 'data', () => {
                    fs.writeFile(path.join(physicalFileSystemRoot, 'file2'), 'data', () => {
                    fs.writeFile(path.join(physicalFileSystemRoot, 'file3'), 'data', () => {
                    fs.writeFile(path.join(physicalFileSystemRoot, 'file4'), 'data', () => {
                        resolve();
                    })
                    })
                    })
                    })
                })
                })
                })
                })
                })
                })
                })
                })
                })
                })
            })
            })
        });
    }

    const move = (server, pathFrom, pathTo, httpCode) => {
        return new Promise<void>((resolve, reject) => {
            info.req({
                url: 'http://localhost:' + server.options.port + pathFrom,
                method: 'MOVE',
                headers: {
                    overwrite: 'T',
                    destination: pathTo
                }
            }, httpCode, () => {
                resolve();
            })
        })
    }

    const read = (server, filePath, httpCode, expectedContent?: string, headers?: Headers) => {
        return new Promise<void>((resolve, reject) => {
            info.req({
                url: 'http://localhost:' + server.options.port + filePath,
                method: 'GET',
                headers: headers
            }, httpCode, (res, body) => {
                if(expectedContent === undefined) {
                    resolve();
                } else if(body && body.toString() === expectedContent) {
                    resolve();
                } else {
                    reject(`File content doesn't match!`);
                }
            })
        })
    }

    const write = (server, filePath, httpCode, content: string, headers?: Headers) => {
        return new Promise<void>((resolve, reject) => {
            info.req({
                url: 'http://localhost:' + server.options.port + filePath,
                method: 'PUT',
                headers: headers,
                body: content
            }, httpCode, () => {
                resolve();
            })
        })
    }

    const propfind = (server, filePath, httpCode, headers?: Headers) => {
        return new Promise<void>((resolve, reject) => {
            info.req({
                url: 'http://localhost:' + server.options.port + filePath,
                method: 'PROPFIND',
                headers: headers,
            }, httpCode, () => {
                resolve();
            })
        })
    }

    const escapeRoot = path.join(__dirname, 'pathTraversalTestFolder');
    const physicalFileSystemRoot = path.join(escapeRoot, 'fsRoot');

    const server = info.init(1, {
        rootFileSystem: new v2.PhysicalFileSystem(physicalFileSystemRoot),
    });

    await createEnv();

    // Allowed writes
    await write(server, '/fileX', v2.HTTPCodes.Created, 'test');
    await write(server, '/./fileX', v2.HTTPCodes.OK, 'test 2');

    await write(server, '/../fileX', v2.HTTPCodes.Forbidden, 'test');
    await write(server, '/../../fileX', v2.HTTPCodes.Forbidden, 'test');
    await write(server, '/.././../fileX', v2.HTTPCodes.Forbidden, 'test');
    await write(server, '/..%5CfileY', v2.HTTPCodes.Forbidden, 'test');

    // Allowed reads
    await read(server, '/file1', v2.HTTPCodes.OK, 'data');
    await read(server, '/notExisting/../file1', v2.HTTPCodes.OK, 'data');

    // Forbidden to leave and come back in the path.
    // This avoids to spy on the real file system.
    await read(server, '/../fsRoot/file1', v2.HTTPCodes.Forbidden);

    // Path traversal through 'If' header
    await read(server, '/file1', v2.HTTPCodes.OK, 'data', {
        If: `</file1> (DAV:no-lock)`
    });
    await read(server, '/file1', v2.HTTPCodes.OK, 'data', {
        If: `</file2> (DAV:no-lock)`
    });
    await read(server, '/file1', v2.HTTPCodes.Forbidden, undefined, {
        If: `</../file1> (DAV:no-lock)` // path doesn't exist
    });
    await read(server, '/file1', v2.HTTPCodes.Forbidden, undefined, {
        If: `</..> (DAV:no-lock)`
    });
    await read(server, '/file1', v2.HTTPCodes.Forbidden, undefined, {
        If: `</../fsRoot/file1> (DAV:no-lock)` // physical path exists
    });

    // Allowed propfinds
    await propfind(server, '/', v2.HTTPCodes.MultiStatus);
    await propfind(server, '/.', v2.HTTPCodes.MultiStatus);
    await propfind(server, '/./', v2.HTTPCodes.MultiStatus);
    await propfind(server, '/file1/../', v2.HTTPCodes.MultiStatus);
    await propfind(server, '/./file1/./../', v2.HTTPCodes.MultiStatus);

    // Forbidden propfinds
    await propfind(server, '/../fsRoot/', v2.HTTPCodes.Forbidden);
    await propfind(server, '/../', v2.HTTPCodes.Forbidden);
    await propfind(server, '/%2e%2e/', v2.HTTPCodes.Forbidden);

    // Allowed moves
    await move(server, '/file1', '/file1-moved', v2.HTTPCodes.Created);
    await move(server, '/file3', '/notExisting/../file3-moved', v2.HTTPCodes.Created);
    await move(server, '/file3-moved', '/./file3', v2.HTTPCodes.Created);
    await move(server, '/file4', encodeURIComponent('/..／file4-moved'), v2.HTTPCodes.Created);
    
    // Forbidden to leave and come back in the path.
    // This avoids to spy on the real file system.
    await move(server, '/file2', `/../fsRoot/file2-spy`, v2.HTTPCodes.Forbidden);
    await move(server, '/file2', `/../fsRootWrong/file2-spy`, v2.HTTPCodes.Forbidden);

    // Forbidden to escape.
    await move(server, '/file2', '/../file-escaped', v2.HTTPCodes.Forbidden);
    await move(server, '/file2', '/notExisting/../../file-escaped', v2.HTTPCodes.Forbidden);
    await move(server, '/file2', '/..%5Cfile-escaped', v2.HTTPCodes.Forbidden);
    await move(server, '/file2', '/..\\file-escaped', v2.HTTPCodes.Forbidden);

    isValid(true);

}) as Test;
