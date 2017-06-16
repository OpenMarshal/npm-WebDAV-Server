# WebDAV Server for npm

[![Join the chat at https://gitter.im/npm-WebDAV-Server/Lobby](https://badges.gitter.im/npm-WebDAV-Server/Lobby.svg)](https://gitter.im/npm-WebDAV-Server/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server.svg?branch=master)](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server)
[![Code Climate Rate](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server/badges/gpa.svg)](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server)
[![bitHound Overall Score](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server/badges/score.svg)](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server)
[![Dependencies Status](https://img.shields.io/david/OpenMarshal/npm-WebDAV-Server.svg)](https://david-dm.org/OpenMarshal/npm-WebDAV-Server.svg)
[![License](https://img.shields.io/npm/l/webdav-server.svg)](http://unlicense.org/)
[![npm Version](https://img.shields.io/npm/v/webdav-server.svg)](https://www.npmjs.com/package/webdav-server)

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

This project rely upon the [RFC4918](http://www.webdav.org/specs/rfc4918.html).

This is an active project. Do not hesitate to post an issue if you have an idea or if you encounter a problem.

# Install

```bash
npm install webdav-server
```

# Quick usage

```javascript
// TypeScript
import * as webdav from 'webdav-server'
// Javascript
const webdav = require('webdav-server');

const um = new webdav.SimpleUserManager();
const user = um.addUser('myUsername', 'myPassword', false);

const pm = new webdav.SimplePathPrivilegeManager();
pm.setRights(user, '/', [ 'all' ]);

const server = new webdav.WebDAVServer({
    privilegeManager: pm,
    userManager: um,
    isVerbose: true,
    port: 1900
});
server.start(() => console.log('READY'));
```

More examples at the [example page of the wiki](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Examples).

More information/possibilities in the [documentation](https://github.com/OpenMarshal/npm-WebDAV-Server/wiki).
