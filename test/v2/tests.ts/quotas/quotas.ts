import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, propfind } from './.createFiles'

export default ((info, isValid) =>
{
    info.init(11);
    
    starter(info, isValid, (s) => {
        propfind(s, info, 'folder', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
            const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
            const available = parseInt(props.find('DAV:quota-available-bytes').findText());
            const used = parseInt(props.find('DAV:quota-used-bytes').findText());

            if(available !== 100)
                return isValid(false, 'The "DAV:quota-available-bytes" must be equals to 100');
            if(used > 0)
                return isValid(false, 'The "DAV:quota-used-bytes" must contains 0');

            isValid(true);
        })
    });
    
    starter(info, isValid, (s) => {
        propfind(s, info, 'file', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
            const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
            const available = parseInt(props.find('DAV:quota-available-bytes').findText());
            const used = parseInt(props.find('DAV:quota-used-bytes').findText());

            if(available !== 100)
                return isValid(false, 'The "DAV:quota-available-bytes" must be equals to 100');
            if(used > 0)
                return isValid(false, 'The "DAV:quota-used-bytes" must contains 0');

            isValid(true);
        })
    });
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file2',
            method: 'PUT'
        }, v2.HTTPCodes.Created, () => {
            propfind(s, info, 'file2', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                const available = parseInt(props.find('DAV:quota-available-bytes').findText());
                const used = parseInt(props.find('DAV:quota-used-bytes').findText());

                if(available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if(used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');

                isValid(true);
            })
        })
    });
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder/file',
            method: 'PUT'
        }, v2.HTTPCodes.Created, () => {
            propfind(s, info, 'folder/file', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                const available = parseInt(props.find('DAV:quota-available-bytes').findText());
                const used = parseInt(props.find('DAV:quota-used-bytes').findText());

                if(available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if(used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');

                isValid(true);
            })
        })
    });
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder2',
            method: 'MKCOL'
        }, v2.HTTPCodes.Created, () => {
            propfind(s, info, 'folder2', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                const available = parseInt(props.find('DAV:quota-available-bytes').findText());
                const used = parseInt(props.find('DAV:quota-used-bytes').findText());

                if(available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if(used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');

                isValid(true);
            })
        })
    });
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder/folder',
            method: 'MKCOL'
        }, v2.HTTPCodes.Created, () => {
            propfind(s, info, 'folder/folder', v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                const props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                const available = parseInt(props.find('DAV:quota-available-bytes').findText());
                const used = parseInt(props.find('DAV:quota-used-bytes').findText());

                if(available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if(used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');

                isValid(true);
            })
        })
    });

    let content = '';
    for(let i = 0; i < 1000; ++i)
        content += 'A';
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file2',
            method: 'PUT',
            body: content
        }, v2.HTTPCodes.InsufficientStorage, () => {
            isValid(true);
        })
    });

    let content2 = '';
    for(let i = 0; i < 100; ++i)
        content2 += 'A';
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            body: content2
        }, v2.HTTPCodes.OK, () => {
            isValid(true);
        })
    });

    let content3 = '';
    for(let i = 0; i < 99; ++i)
        content3 += 'A';
    
    starter(info, isValid, (s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            body: content3
        }, v2.HTTPCodes.OK, () => {
            let content4 = '';
            for(let i = 0; i < 99; ++i)
                content4 += 'A';
            
            starter(info, isValid, (s) => {
                info.req({
                    url: 'http://localhost:' + s.options.port + '/file',
                    method: 'PUT',
                    body: content4
                }, v2.HTTPCodes.OK, () => {
                    isValid(true);
                })
            });
        })
    });

    let content5 = '';
    for(let i = 0; i < 100; ++i)
        content5 += 'A';
    
    starter(info, isValid, (s) => {
        info.reqStream({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT'
        }, (res) => {
            isValid(res.statusCode === v2.HTTPCodes.OK);
        }).end(content5);
    });

    let content6 = '';
    for(let i = 0; i < 1000; ++i)
        content6 += 'A';
    
    starter(info, isValid, (s) => {
        info.reqStream({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            canFail: true
        }, (res) => {
            isValid(res.statusCode === v2.HTTPCodes.InsufficientStorage);
        }).end(content6);
    });

}) as Test;
