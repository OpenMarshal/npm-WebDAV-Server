import { WebDAVServer } from './server/WebDAVServer'

var serv = new WebDAVServer();
serv.beforeRequest((arg, next) => {
    console.log(arg.uri);
    next();
})
serv.afterRequest((arg, next) => {
    console.log('after');
    next();
})
serv.start(1900);
