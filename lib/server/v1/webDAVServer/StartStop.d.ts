import { WebDAVServerStartCallback } from './Types';
export declare function start(port?: number | WebDAVServerStartCallback, callback?: WebDAVServerStartCallback): void;
export declare function stop(callback: () => void): void;
