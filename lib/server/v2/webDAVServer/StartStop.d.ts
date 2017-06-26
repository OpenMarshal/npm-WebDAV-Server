import { WebDAVServerStartCallback } from './WebDAVServer';
export declare function start(port?: number | WebDAVServerStartCallback, callback?: WebDAVServerStartCallback): void;
export declare function stop(callback: () => void): void;
