/// <reference types="node" />
import { WebDAVServerStartCallback } from './WebDAVServer';
import * as http from 'http';
export declare function executeRequest(req: http.IncomingMessage, res: http.ServerResponse, rootPath?: string): void;
export declare function start(port?: number | WebDAVServerStartCallback, callback?: WebDAVServerStartCallback): void;
export declare function stop(callback: () => void): void;
