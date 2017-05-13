# WebDAV Server for npm

[![Build Status](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server.svg?branch=master)](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server)
[![Code Climate Rate](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server/badges/gpa.svg)](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server)
[![bitHound Overall Score](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server/badges/score.svg)](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server)
[![Dependencies Status](https://img.shields.io/david/OpenMarshal/npm-WebDAV-Server.svg)](https://david-dm.org/OpenMarshal/npm-WebDAV-Server.svg)
[![License](https://img.shields.io/npm/l/webdav-server.svg)](http://unlicense.org/)
[![License](https://img.shields.io/npm/v/webdav-server.svg)](https://www.npmjs.com/package/webdav-server)

# Disclaimer

This module is not complete yet.
It implements the following methods :
* HEAD (resource ping)
* GET (file get content)
* MKCOL (directory creation)
* PROPFIND (get file information)
* PUT/POST (set the content of a file and create it if it doesn't exist)
* OPTIONS (list available methods)

Find more details on the process at [https://github.com/OpenMarshal/npm-WebDAV-Server/projects/1](https://github.com/OpenMarshal/npm-WebDAV-Server/projects/1).

This project rely upon [RFC4918](http://www.webdav.org/specs/rfc4918.html).

# Install

```bash
npm install webdav-server
```

# Usage

## Import

### NodeJS
```javascript
const webdav = require('webdav-server')
```

### TypeScript
```typescript
import * as webdav from 'webdav-server'
```

## Create server

### NodeJS / TypeScript
```javascript
const server = new webdav.WebDAVServer(options);
```

*options* is of type `WebDAVServerOptions`. This interface can be found in `webdav.WebDAVServerOptions`

### Options
Key | Default value | Description
-|-|-
port | 1900 | The default port to use if no port is specified when calling `server.start()`.

## Sample

### NodeJS / TypeScript
```javascript
// Typescript
import * as webdav from 'webdav-server'
// Javascript
const webdav = require('webdav-server');

// Create a WebDAV server with options
const server = new webdav.WebDAVServer({
    port: 1900
});

// Create a virtual file
var file = new webdav.VirtualFile('testFile.txt');
// Set the content of the virtual file
file.content = 'The content of the virtual file.';

// Add the virtual file to the root folder
server.rootResource.addChild(file, e => {
    if(e)
        throw e;
});

// Start the server
server.start();

// [...]

// Stop the server
server.stop(() => {
    console.log('Server stopped with success!');
})
```
