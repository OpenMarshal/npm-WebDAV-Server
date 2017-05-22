import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ETag } from '../../resource/IResource'
import { BasicPrivilege } from '../../user/privilege/IPrivilegeManager'
import { XML } from '../../helper/XML'
import * as http from 'http'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, resource) => {
        if(e || !resource)
        {
            arg.setCode(HTTPCodes.NotFound);
            callback();
            return;
        }

        const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

        const multistatus = XML.createElement('D:multistatus', {
            'xmlns:D': 'DAV:'
        })

        resource.type((e, type) => {
            if(!type.isDirectory || arg.depth === 0)
            {
                addXMLInfo(resource, multistatus, () => done(multistatus))
                return;
            }
            
            arg.requirePrivilege('canGetChildren', resource, () => {
                resource.getChildren((e, children) => {
                    let nb = children.length + 1;

                    function nbOut(error)
                    {
                        if(nb > 0 && error)
                        {
                            nb = -1;
                            arg.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }

                        --nb;
                        if(nb === 0)
                            done(multistatus);
                    }

                    addXMLInfo(resource, multistatus, nbOut)
                    
                    children.forEach((child) => {
                        addXMLInfo(child, multistatus, nbOut)
                    })
                })
            })
        })
        
        function addXMLInfo(resource : IResource, multistatus, callback)
        {
            const response = multistatus.ele('D:response')

            const propstat = response.ele('D:propstat')

            const privileges : BasicPrivilege[] = [
                'canGetCreationDate', 'canGetAvailableLocks', 'canGetLastModifiedDate', 'canGetMimeType', 'canGetProperties', 'canGetSize', 'canGetType', 'canGetWebName'
            ];
            if(targetSource)
                privileges.push('canSource');
            arg.requireErPrivilege(privileges, resource, (e, can) => {
                if(e)
                {
                    propstat.ele('D:status').add('HTTP/1.1 ' + HTTPCodes.InternalServerError + ' ' + http.STATUS_CODES[HTTPCodes.InternalServerError]);
                    callback();
                    return;
                }
                
                if(!can)
                {
                    propstat.ele('D:status').add('HTTP/1.1 ' + HTTPCodes.Unauthorized + ' ' + http.STATUS_CODES[HTTPCodes.Unauthorized]);
                    callback();
                    return;
                }

                propstat.ele('D:status').add('HTTP/1.1 200 OK')

                const prop = propstat.ele('D:prop')
                
                let nb = 7;
                function nbOut(error?)
                {
                    if(nb > 0 && error)
                    {
                        nb = -1;
                        callback(error);
                        return;
                    }
                    --nb;
                    if(nb === 0)
                        callback();
                }

                resource.creationDate((e, ticks) => {
                    if(!e)
                        prop.ele('D:creationdate').add(arg.dateISO8601(ticks));
                    nbOut(e);
                })

                arg.getResourcePath(resource, (e, path) => {
                    if(!e)
                        response.ele('D:href').add(arg.fullUri(path).replace(' ', '%20'));
                    nbOut(e);
                })

                resource.webName((e, name) => {
                    if(!e)
                        prop.ele('D:displayname').add(name ? name : '');
                    nbOut(e);
                })

                const supportedlock = prop.ele('D:supportedlock')
                resource.getAvailableLocks((e, lockKinds) => {
                    if(e)
                    {
                        nbOut(e);
                        return;
                    }

                    lockKinds.forEach((lockKind) => {
                        const lockentry = supportedlock.ele('D:lockentry')

                        const lockscope = lockentry.ele('D:lockscope')
                        lockscope.ele('D:' + lockKind.scope.value.toLowerCase())

                        const locktype = lockentry.ele('D:locktype')
                        locktype.ele('D:' + lockKind.type.value.toLowerCase())
                    })
                    nbOut();
                })

                resource.getProperties((e, properties) => {
                    if(e)
                    {
                        nbOut(e);
                        return;
                    }

                    for(const name in properties)
                    {
                        const value = properties[name];
                        prop.ele(name).add(value)
                    }
                    nbOut();
                })

                resource.type((e, type) => {
                    if(e)
                    {
                        nbOut(e);
                        return;
                    }

                    const resourcetype = prop.ele('D:resourcetype')
                    if(type.isDirectory)
                        resourcetype.ele('D:collection')
                    
                    if(type.isFile)
                    {
                        nb += 2;
                        resource.mimeType(targetSource, (e, mimeType) => {
                            if(!e)
                                prop.ele('D:getcontenttype').add(mimeType)
                            nbOut(e);
                        })
                        resource.size(targetSource, (e, size) => {
                            if(!e)
                                prop.ele('D:getcontentlength').add(size)
                            nbOut(e);
                        })
                    }

                    nbOut();
                })

                resource.lastModifiedDate((e, lastModifiedDate) => {
                    if(!e)
                    {
                        prop.ele('D:getetag').add(ETag.createETag(lastModifiedDate))
                        prop.ele('D:getlastmodified').add(new Date(lastModifiedDate).toUTCString())
                    }
                    nbOut(e);
                })
            })
        }

        function done(multistatus)
        {
            arg.setCode(HTTPCodes.MultiStatus);
            arg.writeXML(multistatus);
            callback();
        }
    })
}
