# WebDAV Server for npm

[![Build Status](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server.svg?branch=master)](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server)
[![Code Climate Rate](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server/badges/gpa.svg)](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server)
[![Dependencies Status](https://img.shields.io/david/OpenMarshal/npm-WebDAV-Server.svg)](https://david-dm.org/OpenMarshal/npm-WebDAV-Server.svg)
[![License](https://img.shields.io/npm/l/webdav-server.svg)](http://unlicense.org/)
[![npm Version](https://img.shields.io/npm/v/webdav-server.svg)](https://www.npmjs.com/package/webdav-server)

[![Join the chat at https://gitter.im/npm-WebDAV-Server/Lobby](https://badges.gitter.im/npm-WebDAV-Server/Lobby.svg)](https://gitter.im/npm-WebDAV-Server/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join the chat at https://gitter.im/npm-WebDAV-Server/help-v2](https://img.shields.io/badge/chat-help%20v2-blue.svg)](https://gitter.im/npm-WebDAV-Server/help-v2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join the chat at https://gitter.im/npm-WebDAV-Server/help-v1](https://img.shields.io/badge/chat-help%20v1-blue.svg)](https://gitter.im/npm-WebDAV-Server/help-v1?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join the chat at https://gitter.im/npm-WebDAV-Server/file-systems](https://img.shields.io/badge/chat-%40webdav--server-blue.svg)](https://gitter.im/npm-WebDAV-Server/file-systems?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Description

This server can use physical resources (files and folders on a hard drive, for instance), virtual resources (in-memory files and folders), processed/computed resources (for instance a file which provide the content of a remote web page), customized resources (whatever you created, whatever you can imagine), and use all of them on the same server instance. And it's easy to integrate in your JavaScript code!

You can use it to provide human readable content, easily manageable thanks to the WebDAV clients, or use a temporary and virtual file system to share information between running programs, or store crypted documents while still being able to use them as if they were not crypted (take a look at [`cwdav`](https://www.npmjs.com/package/cwdav)), etc...

This is a fully configurable server. You can use you own user manager, your own resources, your own HTTP methods, your own way to save the state of the server, etc... Find more in the [documentation](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki).

# Project information

Here are some project related links :
* [Documentation](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki)
* [Project development details](https://github.com/OpenMarshal/npm-WebDAV-Server/projects)
* [Changelog](https://github.com/OpenMarshal/npm-WebDAV-Server/blob/master/CHANGELOG.md)
* [Examples](https://github.com/OpenMarshal/npm-WebDAV-Server/tree/master/examples)
* [Issues](https://github.com/OpenMarshal/npm-WebDAV-Server/issues)
* [GitHub](https://github.com/OpenMarshal/npm-WebDAV-Server)
* [Gitter (chat)](https://gitter.im/npm-WebDAV-Server/Lobby)
  * [Gitter for version 1](https://gitter.im/npm-WebDAV-Server/help-v1)
  * [Gitter for version 2](https://gitter.im/npm-WebDAV-Server/help-v2)
  * [Gitter for @webdav-server/...](https://gitter.im/npm-WebDAV-Server/file-systems)
  
You can find a list of file systems here :
* [Repositories on GitHub](https://github.com/OpenMarshal/npm-WebDAV-Server-Types/tree/master/repositories)
* [Repositories on npm](https://www.npmjs.com/search?q=%40webdav-server)

This project rely upon the [RFC4918](http://www.webdav.org/specs/rfc4918.html).

This is an active project. Do not hesitate to post an issue if you have an idea or if you encounter a problem.

The project comes with two versions : the obselete version 1 and the version 2. Prefer using the version 2. At the moment, for compatibility issues, to access the version you must use the `v2` namespace.

# Install

```bash
npm install webdav-server
```

# Quick usage

Very simple usage :

```javascript
// TypeScript
import { v2 as webdav } from 'webdav-server'
// JavaScript
const webdav = require('webdav-server').v2;

const server = new webdav.WebDAVServer({
    port: 1900
});

server.start(() => console.log('READY'));
```

With some logs :

```javascript
// TypeScript
import { v2 as webdav } from 'webdav-server'
// JavaScript
const webdav = require('webdav-server').v2;

const server = new webdav.WebDAVServer({
    port: 1900
});

server.afterRequest((arg, next) => {
    // Display the method, the URI, the returned status code and the returned message
    console.log('>>', arg.request.method, arg.requested.uri, '>', arg.response.statusCode, arg.response.statusMessage);
    // If available, display the body of the response
    console.log(arg.responseBody);
    next();
});

server.start(() => console.log('READY'));
```

With a user manager, privilege manager and serialization (save/load the state of the server) :

```javascript
// TypeScript
import { v2 as webdav } from 'webdav-server'
// JavaScript
const webdav = require('webdav-server').v2;

// User manager (tells who are the users)
const userManager = new webdav.SimpleUserManager();
const user = userManager.addUser('username', 'password', false);

// Privilege manager (tells which users can access which files/folders)
const privilegeManager = new webdav.SimplePathPrivilegeManager();
privilegeManager.setRights(user, '/', [ 'all' ]);

const server = new webdav.WebDAVServer({
    // HTTP Digest authentication with the realm 'Default realm'
    httpAuthentication: new webdav.HTTPDigestAuthentication(userManager, 'Default realm'),
    privilegeManager: privilegeManager,
    port: 2000, // Load the server on the port 2000 (if not specified, default is 1900)
    autoSave: { // Will automatically save the changes in the 'data.json' file
        treeFilePath: 'data.json'
    }
});

// Try to load the 'data.json' file
server.autoLoad((e) => {
    if(e)
    { // Couldn't load the 'data.json' (file is not accessible or it has invalid content)
        server.rootFileSystem().addSubTree(server.createExternalContext(), {
            'folder1': {                                // /folder1
                'file1.txt': webdav.ResourceType.File,  // /folder1/file1.txt
                'file2.txt': webdav.ResourceType.File   // /folder1/file2.txt
            },
            'file0.txt': webdav.ResourceType.File       // /file0.txt
        })
    }
    
    server.start(() => console.log('READY'));
})
```

Within `Express` :

```javascript
// TypeScript
import { v2 as webdav } from 'webdav-server'
import * as express from 'express'
// JavaScript
const webdav = require('webdav-server').v2;
const express = require('express');

const server = new webdav.WebDAVServer();
const app = express();

// Mount the WebDAVServer instance
app.use(webdav.extensions.express('/my/sub/path', server));
app.listen(1901); // Start the Express server
```

More examples at the [example page of the wiki](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Examples-%5Bv2%5D).

More information/possibilities in the [documentation](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki).
