import { WebDAVServer } from '../server/v2/export';
/**
 * Mount a WebDAVServer instance on a ExpressJS server.
 *
 * @param root Root path of the mount
 * @param server Server to mount
 */
export declare function express(root: string, server: WebDAVServer): (req: any, res: any, next: any) => any;
