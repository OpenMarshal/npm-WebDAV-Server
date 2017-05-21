# WebDAV Server for npm

[![Build Status](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server.svg?branch=master)](https://travis-ci.org/OpenMarshal/npm-WebDAV-Server)
[![Code Climate Rate](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server/badges/gpa.svg)](https://codeclimate.com/github/OpenMarshal/npm-WebDAV-Server)
[![bitHound Overall Score](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server/badges/score.svg)](https://www.bithound.io/github/OpenMarshal/npm-WebDAV-Server)
[![Dependencies Status](https://img.shields.io/david/OpenMarshal/npm-WebDAV-Server.svg)](https://david-dm.org/OpenMarshal/npm-WebDAV-Server.svg)
[![License](https://img.shields.io/npm/l/webdav-server.svg)](http://unlicense.org/)
[![npm Version](https://img.shields.io/npm/v/webdav-server.svg)](https://www.npmjs.com/package/webdav-server)

# Index

* Disclaimer / Project information
* Install
* Usage
    * Import
    * Create server
        * Options
    * Sample
* Resources
    * Root resource
    * Resource creation
* Authentication / Privileges / User management
    * User management
    * Authentication
    * Privileges
* Control the response body type
* Persistence
* Persistence
    * Overview
    * Example
        * Save
        * Load

# Disclaimer / Project information

Find more details on the development process at [https://github.com/OpenMarshal/npm-WebDAV-Server/projects/1](https://github.com/OpenMarshal/npm-WebDAV-Server/projects/1).

This project rely upon the [RFC4918](http://www.webdav.org/specs/rfc4918.html).

The full set of the standard WebDAV methods are implemented :
* HEAD (resource ping)
* GET (file get content)
* MKCOL (directory creation)
* PROPFIND (get file information)
* PROPPATCH (set/remove resource properties)
* PUT/POST (set the content of a file and create it if it doesn't exist)
* OPTIONS (list available methods)
* DELETE (delete a resource)
* MOVE (move a resource)
* COPY (copy a resource)
* LOCK/UNLOCK (reserve a resource for use)

This is an active project. Do not hesitate to post an issue if you have an idea or if you encounter a problem.

Currently working on providing a real documentation of the module.

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
requireAuthentification | false | Define if your require to be authenticated.
httpAuthentication | new HTTPBasicAuthentication('default realm') | Define the object which will provide the authentication method (HTTP : Basic, Digest, custom, etc).
privilegeManager | new FakePrivilegeManager() | Allow to check the privileges of the user (grant or restrict access).
rootResource | new RootResource() | The root resource to use as `/`.
userManager | new SimpleUserManager() | Define the object which will provide the users.
lockTimeout | 3600 | Define the lock timeout.
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
        
    // Create a virtual folder
    var folder = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(folder, e => {
        if(e)
            throw e;
        
        var file2 = new webdav.PhysicalFile('/home/testFile2.txt');
        folder.addChild(file2, e => {
            if(e)
                throw e;
            
            var folder2 = new webdav.PhysicalFolder('/home/testFolder2');
            folder.addChild(folder2, e => {
                if(e)
                    throw e;
                    
                // Start the server
                server.start();

                // [...]

                // Stop the server
                server.stop(() => {
                    console.log('Server stopped with success!');
                })
            });
        });
    });
});
```

In this example, the resource tree will be the following :
Path|Class
-|-
`/` | RootResource
`/testFile.txt` | VirtualFile
`/testFolder` | VirtualFolder
`/testFolder/testFile2.txt` | PhysicalFile
`/testFolder/testFolder2` | PhysicalFolder

# Resources

There are two kinds of resource provided : the virtual file/folder and the physical file/folder. The virtual resource is a resource you create and keep in memory. The physical resource is a resource present in your current file system.

You can create a custom resource by creating an object or a class which will inherit the members of the IResource class.

The type of a resource can be (class ResourceType) :

-|Is a directory|Is not a directory
-|-|-
**Is a file**|Hibrid|File
**Is not a file**|Directory|NoResource

Here are the differences between the resource types :
-|Hibrid|File|Directory|NoResource
-|-|-|-|-
**Can have content**|yes|yes|no|no
**Can have child resource**|yes|no|yes|no
**Is standard (RFC)**|no|yes|yes|no

## Root resource

The root resource (`class RootResource`) is a resource which disallow almost everything (no copy, no move, etc), but provides a static root folder. It is instanciated by default if no `option.rootResource` is provided to the constructor of the server. This resource is a virtual resource. That's why, if you create a child through the WebDAV interface (HTTP), it will be a virtual resource.

Method|Must be allowed?||Method|Must be allowed?
-|-|-|-|-
**create** | no || **delete** | no
**moveTo** | no || **rename** | no
**append** | may || **write** | may
**read** | may || **mimeType** | may
**size** | may || **getLocks** | yes
**setLock** | yes || **removeLock** | yes
**canLock** | yes || **getAvailableLocks** | yes
**canRemoveLock** | yes || **getLock** | yes
**addChild** | yes || **removeChild** | yes
**getChildren** | yes || **setProperty** | yes
**getProperty** | yes || **removeProperty** | yes
**getProperties** | yes || **creationDate** | yes
**lastModifiedDate** | may || **webName** | yes
**type** | yes

## Resource creation

When a user create a resource through the WebDAV interface (HTTP), it will inherit the parent file system manager. For instance, if you create a file or a folder as a child of the path `/myFolder` and `myFolder` contains a virtual file system manager, then the file or folder created will be a virtual file or a virtual folder. The same reflection can be made with the physical resources and custom resources. The file system manager is in charge of the creation of the resource object (not to call `.create(...)`, just the object). This way, you can have a behavior for a resource (the resource class itself) and a different behavior for its children (the file system manager).

If you create a resource through the module (for instance in JavaScript), you can add as child of a resource the kind of resource you want. You are limited only by the type of the parent resource and its implementation.

# Authentication / Privileges / User management

## User management

The user management is get through an instance of the class `IUserManager` which provide users of the class `IUser`.

A `IUserManager` class must contains the following public fields :
```typescript
getUserByName(name : string, callback : (error : Error, user : IUser) => void)
getDefaultUser(callback : (user : IUser) => void)
getUsers(callback : (error : Error, users : IUser[]) => void)
```

A `IUser` class must contains the following public fields :
```typescript
isAdministrator : boolean
isDefaultUser : boolean
password : string
username : string
```

The `IUserManager` class can get a user by name ; it can get the list of all users ; and it can get the default user.

The default user is the user which is given to an unauthentication user. This way, an unauthenticated user will have the privileges of the default user. If the server's option `requireAuthentification` equals `true`, the default user will not be used.

Thanks to the server's option `userManager`, the user manager can be set with a custom instance. This way, you can create a user manager which, for instance, retrieve its users from a database.

## Authentication

The authentication is made through the HTTP authentication system. The standard authentication systems use a HTTP header to get the user credentials.

Thanks to the server's option `httpAuthentication`, it is possible to define the authentication system you want to use, even a custom one.

It musts inherit from the interface `HTTPAuthentication` :
```typescript
realm : string

askForAuthentication() : any
getUser(arg : MethodCallArgs, userManager : IUserManager, callback : (error : Error, user : IUser) => void)
```

The `askForAuthentication()` method is used by the server to know what headers the method needs to add to its response.

The `getUser()` method is used by the server to get the user of the current request.

There are two authentication system implemented in the modules : `HTTPBasicAuthentication` and `HTTPDigestAuthentication`.

The class `HTTPBasicAuthentication` implements the `Basic` authentication system and is the most commonly used on internet. The class `HTTPDigestAuthentication` implements the `Digest` authentication system and provides a more secure way to authenticate.

## Privileges

The privileges of a user upon a resource is defined by the instance of the interface `IPrivilegeManager` provided in the server's option `privilegeManager`. This object provides a list of methods to tell the server that a resource is accessible by a user or if it is not.

Here is the list of the methods in the interface `IPrivilegeManager` :
```typescript
canCreate : PrivilegeManagerMethod
canDelete : PrivilegeManagerMethod
canMove : PrivilegeManagerMethod
canRename : PrivilegeManagerMethod
canAppend : PrivilegeManagerMethod
canWrite : PrivilegeManagerMethod
canRead : PrivilegeManagerMethod
canGetMimeType : PrivilegeManagerMethod
canGetSize : PrivilegeManagerMethod
canListLocks : PrivilegeManagerMethod
canSetLock : PrivilegeManagerMethod
canRemoveLock : PrivilegeManagerMethod
canGetAvailableLocks : PrivilegeManagerMethod
canGetLock : PrivilegeManagerMethod
canAddChild : PrivilegeManagerMethod
canRemoveChild : PrivilegeManagerMethod
canGetChildren : PrivilegeManagerMethod
canSetProperty : PrivilegeManagerMethod
canGetProperty : PrivilegeManagerMethod
canGetProperties : PrivilegeManagerMethod
canRemoveProperty : PrivilegeManagerMethod
canGetCreationDate : PrivilegeManagerMethod
canGetLastModifiedDate : PrivilegeManagerMethod
canGetWebName : PrivilegeManagerMethod
canGetType : PrivilegeManagerMethod
```
With :
```typescript
type PrivilegeManagerCallback = (error : Error, hasAccess : boolean) => void;
type PrivilegeManagerMethod = (arg : MethodCallArgs, resource : IResource, callback : PrivilegeManagerCallback) => void
```

The request relative information (the user, the request, etc) are in the `arg` parameter.

# Control the response body type

By default, when there is a body in the WebDAV response, it will be in XML. If there is a `Accept` header in the request with the `json` type as a priority, the result will be in JSON.

# Persistence

## Overview

It is possible to save your architecture using `server.save(...)` and you can reload it with `server.load(...)`.
The serialization/unserialization is made by the file system manager of the resource.
The children of a resource are managed by the server itself, not by the file system manager.
You can save and load while the server is running, but if a request is processing, it may lead to an inconsistent state.
A trick would be to save when a request is completed (`server.afterRequest(...)`).

## Example

### Save

```javascript
server.save((e, data) => {
    if(e)
        throw e;
    
    fs.writeFile('persistence.data', JSON.stringify(data), (e) => {
        if(e)
            throw e;
        
        // [...]
    })
})
```

### Load

```javascript
fs.readFile('persistence.data', (e, data) => {
    if(e)
        throw e;
    
    server.load(JSON.parse(data), [
        new webdav.PhysicalFSManager(),
        new webdav.VirtualFSManager(),
        new webdav.RootFSManager()
    ], (e) => {
        if(e)
            throw e;
        
        // [...]
    });
})
```
