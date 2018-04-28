# Changelog

# 2.3.18

### Bug fix
* Fixed the name of the namespace of the elements added when not found in a PROPFIND request/response *[1b2b9cc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1b2b9cc)*

# 2.3.17

### Documentation
* Added some comments for some methods/functions *[470c090](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/470c090)*
* Added an example to display how to add logs *[5eafa1a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5eafa1a)*

### Bug fix
* Fixed the property name (changed from 'inline namespace' to 'attribute namespace') of not found properties in the response of PROPFIND which was causing errors in the parsing of the XML response *[f215bf7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f215bf7)*

# 2.3.16

### Other
* Now provide the stream in the data of the 'openReadStream' and 'openWriteStream' events *[c72def0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c72def0)*

### Tests
* Added tests for security about regex *[be2190a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/be2190a)*
* Exported the 'info.expected(...)' method in the v2 tests *[983da9c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/983da9c)*

### Bug fix
* Fixed some security flaws about Regex *[d9c7194](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d9c7194)*

# 2.3.15

### Other
* Removed a missed 'console.log(...)' *[c549111](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c549111)*

### Tests
* Increased the timeout of the tests of the v2 from 6000 ms to 15000 ms *[b9684be](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b9684be)*

# 2.3.14

### Other
* Added a npm command for tslint *[25b3dcc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/25b3dcc)*
* Refactored some code *[2dba204](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2dba204)*
* Updated the code checking *[75fcf43](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/75fcf43)*
* Updated the code checking *[70abf32](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/70abf32)*
* Trying to decrease cognitive complexity of 'standardCopy' of the standard methods *[d8a495f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d8a495f)*
* Refactored similar methods of 'VirtualFileSystem' *[612c91b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/612c91b)*
* Excluded the 'examples' folder of lint *[1d68ec3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1d68ec3)*
* Moved all v1 files into v1 folders *[4a1a417](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4a1a417)*
* Added v1 to the files to ignore for BitHound *[fe39d58](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fe39d58)*
* Cleaned the code of Propfind *[371228e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/371228e)*
* Upgraded the '.codeclimate.yml' file *[07a84ce](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/07a84ce)*
* Excluded v1 from CodeClimate *[60a7e2d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/60a7e2d)*
* Excluded v1 from tslint *[0f06ed4](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0f06ed4)*
* Updated the dependency version of @types/request and @types/node *[3f26a18](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3f26a18)*

### Bug fix
* Fixed the PROPPATCH method => returned LOCKED instead of NOT AUTHORIZED (authentication) *[90acbe1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/90acbe1)*
* Fixed the OPTIONS result ('Allow' header) on the root element *[2cec981](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2cec981)*
* Fixed a lot of lint errors *[7de911b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7de911b)*
* Fixed some tslint errors *[8f54de5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8f54de5)*
* Fixed compilation errors with request headers which can contain 'string[]' *[1fcbbe2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1fcbbe2)*

# 2.3.13

### Documentation
* Updated the README to display the ExpressJS extension *[0c9f4af](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0c9f4af)*

### New features
* Added extension for ExpressJS *[9114666](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9114666)*

# 2.3.12

### Other
* Added support for a new root path in 'executeRequest' *[876629a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/876629a)*

### Bug fix
* Fixed the example of using the library in Express *[4bf7bd3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4bf7bd3)*
* Fixed the wrong example of use in ExpressJS *[7777cb4](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7777cb4)*

# 2.3.11

### Documentation
* Added comments / inline doc for the 'WebDAVServer' class's methods *[0e36914](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0e36914)*

### Tests
* Added tests for the encoding of the URL / displayName in PROPFIND *[45e9c56](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/45e9c56)*

# 2.3.10

### Documentation
* Transformed in README.md 'Javascript' into 'JavaScript' to match 'TypeScript' *[5d1da18](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5d1da18)*
* Added Express compatibility explaination in the README *[b61c7d5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b61c7d5)*

### Other
* Cleaned the code (mainly the imports) *[cad8d1d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/cad8d1d)*
* Exported the function/method 'executeRequest' to execute requests without the server started *[fc22c3b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fc22c3b)*

### Bug fix
* Fixed the parsing of the url when it is empty *[205e28a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/205e28a)*

# 2.3.9

### Bug fix
* Removed the encoding of the 'displayname' tag *[b151337](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b151337)*

# 2.3.8

### Bug fix
* Fixed the URL encoding on all 'href', 'location' and 'displayname' tags in the XML responses *[5d48f22](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5d48f22)*

# 2.3.7

### Bug fix
* Fixed the special character problem with a more generic solution *[6d54bd0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6d54bd0)*

# 2.3.6

### Bug fix
* Fixed spaces not being encoded *[55261d5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/55261d5)*

# 2.3.5

### Other
* Removed old/commented code from the Propfind.ts file *[40e3792](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/40e3792)*
* Compiled the change made by @leak4mk0 *[8e43d93](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8e43d93)*
* Merge pull request #21 from leak4mk0/patch-1 *[5943f26](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5943f26)*

### Bug fix
* Fixed an issue where an error 'e' is ignored after readdir. *[716cba6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/716cba6)*

# 2.3.4

### Tests
* Added a few more tests for the MOVE method on files *[da1c79a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/da1c79a)*

### Other
* Modified the behaviour of the PROPFIND method when an error occurs in the child resources *[a91227b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a91227b)*

### Bug fix
* Fixed the '_move' method in the 'PhysicalFileSystem' class *[656d0f6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/656d0f6)*

# 2.3.

### Tests
* Added tests for the new features of the 'addSubTree' method *[0f2c1d9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0f2c1d9)*

### Other
* Updated the dependencies of the project *[48e7287](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/48e7287)*
* Added the support of a string and a buffer as value in the 'addSubTree' method *[3380374](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3380374)*

# 2.3.2

### Documentation
* Fixed the wrong link to the example page in the 'README' file *[91c28cd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/91c28cd)*

# 2.3.1

### Bug fix
* Modified the 'VirtualFileSystemResource' class to test the type of the constructor argument based on it's properties instead of it's constructor *[2f012cd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2f012cd)*

# 2.3.0

### New features
* Added the storage manager to allow to limit the storage *[74094e3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/74094e3)*
* Added a method in the server to give the listing of resources *[18f0e3a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/18f0e3a)*
* Added a 'autoSave' method to the server to start the auto-save without starting the HTTP server *[481413d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/481413d)*
* Added 'before-*' file system events *[8763396](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8763396)*

### Tests
* Added the ability to fail a streaming request in the tests (v2) *[6eb0cd0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6eb0cd0)*
* Added tests for the quotas *[d191d72](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d191d72)*
* Added tests for the 'server.listResources(...)' method *[0caed21](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0caed21)*

### Bug fix
* Fixed custom properties' attributes removing the property namespace (xmlns) *[70c5341](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/70c5341)*

# 2.2.3

### Bug fix
* Fixed the missing 'lock' argument in the callback of the 'refresh' method of the lock manager returned in the 'FileSystem' class *[3dae2aa](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3dae2aa)*

# 2.2.2

### Other
* Removed forgotten 'console.log' *[3277908](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3277908)*

# 2.2.1

### Other
* Exported the 'IRange' interface of the 'Range' header parsing *[961f1e7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/961f1e7)*

### Bug fix
* Fixed the delete method in the 'PhysicalFileSystem' class *[da9abf0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/da9abf0)*

# 2.2.0

### New features
* Added support for the sequence/multipart, start and end types of the 'Range' header in the 'GET' method *[dd23bfc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/dd23bfc)*
* Added 'Range' support in the 'HEAD' method to better fit the 'GET' response without body *[6ebfd98](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6ebfd98)*

### Tests
* Added more tests for the 'Range' header of the 'Get' method :
  * *[6945b31](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6945b31)*
  * *[25a1cf3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/25a1cf3)*
* Added more server ports to the tests of the v2 :
  * *[68172a9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/68172a9)*
  * *[98d16af](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/98d16af)*

### Other
* Exported the 'Range' header parser to be usable in the 'GET' and 'HEAD' methods *[a2aabce](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a2aabce)*


# 2.1.0

### New features
* Added server wide events *[6786998](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6786998)*
* Added file system wide events *[9a5688c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9a5688c)*

### Tests
* Added tests for the events *[f8d8969](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f8d8969)*
* Added tests for the ranged GET *[647a8c3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/647a8c3)*

### Bug fix
* Fixed the GET Range *[3b2d11f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3b2d11f)*

# 2.0.19

### Changes
* Added headers to allow cross domain access to the server *[654886c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/654886c)*

### Bug fix
* Fixed a bug on the mkcol method *[4dcabe7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4dcabe7)*

# 2.0.18

### Changes
* Removed the decoding in the 'Path' class *[ad5c8a6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ad5c8a6)*

### Bug fix
* Fixed the URL decoding in the 'Path' class to be able to work with fully encoded and partially encoded URL *[5a743a9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5a743a9)*

# 2.0.17

### Changes
* Removed the URL encoding in the 'href' tags and in the 'displayname' tags *[014820b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/014820b)*

### Other
* Excluded the folder experiment :
  * *[8abda60](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8abda60)*
  * *[e966921](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e966921)*

### Bug fix
* Fixed wrong content length when the content contains special characters + Specified the encoding when writing to the response body (UTF-8) + Minimified the 'Content-Type' header in the 'writeBody' method of the 'RequestContext' class *[c12096a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c12096a)*

# 2.0.16

### Bug fix
* Fixed the 'HTTPDigestAuthentication' class of the v1 and v2 to work with the level 0 of the digest authentication *[6247297](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6247297)*

# 2.0.15

### Bug fix
* Fixed the 'LOCK' method which needed the 'owner' in the lock properties (which was made optional in the past) *[21a4a94](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/21a4a94)*

# 2.0.14

### Changes
* Use 'xml-js-builder' npm package instead of built-in XML manager *[15e4f2d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/15e4f2d)*

# 2.0.13

### Bug fix
* Fixed a bug saying that the callback is not a function when calling the 'readDir' method of a file system *[57056d0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/57056d0)*

# 2.0.12

### Bug fix
* Fixed the standard copy/move methods to copy/move the source content of the resource *[ec0144e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ec0144e)*

# 2.0.11

### Changes
* Modified the 'VirtualSerializer' class serialize 'resources' into a property of the serialized object instead of being the serialized object *[2833836](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2833836)*
* Added the 'VirtualSerializerVersions' and 'PhysicalSerializerVersions' object to provide a list of versions of the serializers *[2833836](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2833836)*

# 2.0.10

### Changes
* Modified the class name from '_VirtualFileSystemResource' into 'VirtualFileSystemResource' *[8e8b425](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8e8b425)*
* Modified the class name from '_PhysicalFileSystemResource' into 'PhysicalFileSystemResource' *[a09fe35](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a09fe35)*

### Documentation
* Added a 2nd example of creating a custom method for the server *[d191897](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d191897)*
* Added a README to the examples folder *[5efdead](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5efdead)*

### Other
* Cleaned the code :
  * *[50782df](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/50782df)*
  * *[6acbcdd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6acbcdd)*
* Removed the 'no-conditional-assignment' lint *[03105d9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/03105d9)*

### Bug fix
* Fixed the HEAD method crashing when the size of a resource is undefined *[de276ff](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/de276ff)*

# 2.0.9

### Bug fix
* Fixed the constructor by copy of the 'LocalPropertyManager' class and the 'LocalLockManager' class *[a5fb4c0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a5fb4c0)*

# 2.0.8

### Bug fix
* Fixed the persistence (untriggered close event on saving) *[7e7f86d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7e7f86d)*

# 2.0.7

### Changes
* Removed the initial GZip/GUnZip of the persistence => now it is a default behaviour *[ac1fd34](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ac1fd34)*
* Modified the 'IAutoSave' interface to fit cases *[ac1fd34](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ac1fd34)*

### Documentation
* Added the use of the method in the 'Custom Method' example *[c9f34e3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c9f34e3)*
* Added a note to the README of the 'Custom Method' example *[e58fdaf](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e58fdaf)*
* Added the 'Custom Method' example *[eadb2b8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/eadb2b8)*

### Bug fix
* Fixed the 'create' method of the 'FileSystem' class which was not creating more than 1 intermediate *[4b1cb25](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4b1cb25)*

# 2.0.6

### Changes
* Modified the LOCK method to make the owner tag optional *[7a34231](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7a34231)*

### Bug fix
* Fixed the 'SimplePathPrivilegeManager' class to add sub-rights when calling the 'setRights' method *[aaeed0c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aaeed0c)*
* Fixed a bad privilege check in the 'FileSystem' class which asked write rights for reading available locks of a resource *[feb1fe0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/feb1fe0)*

# 2.0.5

### New features
* Allow to override the privilege checking in the context to allow special operations (list all locks, for instance) *[b96fde6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b96fde6)*
* Added the 'isLocked' method in the 'Resource' class and in the 'ContextualFileSystem' class *[7e3a142](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7e3a142)*

### Tests
* Upgraded the tests for the persistence to fail if the an error occurs while saving *[7f7a3cd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7f7a3cd)*

### Bug fix
* Removed a bad privilege check in the 'listDeepLocks' method of the 'FileSystem' class *[2023611](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2023611)*

# 2.0.4

### New features
* Modified the 'FileSystem' class and the serialization method to skip/allow non-serializable file system (skip the serialization of a fs if 'fs.serializer()' returns null/undefined) *[43acf3f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/43acf3f)*

### Documentation
* Added comments to describe methods of the 'FileSystem' class and the 'FileSystemSerializer' interface for better code completion details *[e95de1a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e95de1a)*
* Fixed the missing description of the 2nd example in the README *[218d907](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/218d907)*
* Added the '@webdav-server' npm packages information in the README *[d80b6ab](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d80b6ab)*

### Bug fix
* Fixed the 'isLocked' method of the 'FileSystem' class to skip privilege checking *[f201b61](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f201b61)*
* Fixed the 'SimplePathPrivilegeManager' class *[25a9529](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/25a9529)*

# 2.0.3

### Changes
* The default behaviour of the 'size' method in the 'FileSystem' class is now to return 'undefined' as value (= cannot tell the size) *[4aed15f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4aed15f)*
* Made the 'Content-Length' header optional in the response when no size can be obtained *[0f1cdcd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0f1cdcd)*

# 2.0.2

### Bug fix
* Fixed the MOVE method *[592d2bc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/592d2bc)*
* Fixed the 'autoLoad' method to not crash when the 'autoSave' option is missing *[a03cc96](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a03cc96)*

# 2.0.1

### Documentation
* Fixed wrong place of the deprecated comment *[b6ed379](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b6ed379)*

# 2.0.0

### New features
* Version 2!
* Added the body written through the 'writeBody(...)' method as property of the 'RequestContext' class *[266e900](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/266e900)*
* Added the attributes to the stored properties affected by PROPPATCH *[f8f6e00](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f8f6e00)*
* Added the reverse operation in the PROPPATCH method to fit the RFC (1 error => reverse changes) *[f14cde3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f14cde3)*
* Added an error in the 'Errors' bundle to say that the user has not enough privilege *[f488ecc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f488ecc)*
* Modified the 'Workflow' class to stop some executions when possible if the workflow ended *[e0e4232](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e0e4232)*
* Implemented the 'SimplePathPrivilegeManager' class to manage privileges based on the path *[6656596](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6656596)*
* Implemented the PrivilegeManager [v2] *[4c526b8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4c526b8)*
* Implemented the v2 *[6e58ac6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6e58ac6)*
* The XML helper will now throw a more meaningful error message when the 'find(...)' method doesn't find the XMLElement, helping for debugging *[b49c35a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b49c35a)*
* Added the depth to the 'Lock' class *[fbeeb71](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fbeeb71)*

### Changes
* Changed to check by reference by default when seeking for a file system *[e39fd71](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e39fd71)*
* Added the user as argument in the privilege managers *[8908c87](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8908c87)*
* Splitted the 'RequestContext' class into 'RequestContext', 'ExternalRequestContext' and 'HTTPRequestContext' *[faf8581](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/faf8581)*
* Added a constructor to help unserialization in the 'LocalPropertyManager' class and the 'LocalLockManager' class0e78d10 Fixed the 'PhysicalFileSystem' class *[f8b3b46](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f8b3b46)*
* The user used by the 'createExternal(...)' static method of the 'RequestContext' class is now a super-admin user unreferenced by the user manager *[50e1194](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/50e1194)*
* Made the callback optional in the 'addSubTree' of the 'FileSystem' class *[d81a883](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d81a883)*
* Removed the event system from the server *[882ca71](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/882ca71)*
* Made the 'treeFilePath' server option of 'autoLoad' optional (default value is the 'treeFilePath' of 'autoSave') *[386f04a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/386f04a)*
* Changed the type of the 'privilegeManager' server option from the old 'IPrivilegeManager' to the new 'PrivilegeManager' *[386f04a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/386f04a)*
* Added the 'CreateExternalContext' method to the server class to ease the creation of external contexts *[358e2ee](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/358e2ee)*
* Changed the type of the 'path' argument of the methods in 'FileSystem', 'ContextualFileSystem' and 'Resource' from 'Path' to 'Path | string' to be more easy to use *[5c987c6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5c987c6)*
* Added the 'PrivilegeManagerInfo' interface *[4d29192](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4d29192)*
* Added the 'destinationPath' to the 'RenameInfo' interface *[4d29192](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4d29192)*
* Added the 'setCodeFromError' method and the 'defaultStatusCode' method to the 'RequestContext' class *[8cf9a53](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8cf9a53)*
* Added an error class for unserialization error (when the serializer is not found) *[f488ecc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f488ecc)*
* Added some standard errors to the 'Errors' bundle *[37afaaa](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/37afaaa)*

### Documentation
* Upgraded the README *[29086af](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/29086af)*
* Fixed the README example *[77c44cd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/77c44cd)*
* Fixed the example 'Web Resource' *[75ff834](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/75ff834)*
* Deprecated the v1 'WebDAVServer' class *[2c609e7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2c609e7)*
* Added the 'webResource' example for the v2 *[d406d81](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d406d81)*
* Splitted the 'examples' folder into 'v1' and 'v2' :
  * *[24718da](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/24718da)*
  * *[7518929](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7518929)*

### Tests
* Fixed the tests to use the new 'RequestContext' implementation *[6d41b1b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6d41b1b)*
* Added a 'nbReservedSocketPerTest' in the test framework of the v2 *[72696ad](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/72696ad)*
* Added tests for the PROPPATCH method [v2] *[2be8b93](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2be8b93)*
* Added test for the MOVE and COPY methods [v2] *[0c5e114](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0c5e114)*
* Added tests for the 'addSubTree' method of the server/file systems [v2] *[5d5d3a2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5d5d3a2)*
* Added tests for the HEAD method *[651f797](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/651f797)*
* Added tests for the MKCOL method *[d895732](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d895732)*
* Added tests for the DELETE method *[59e4201](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/59e4201)*
* Upgraded the test framework of the v2 *[a9edc7e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a9edc7e)*
* Added test for the persistence [v2] *[deb443b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/deb443b)*
* Added test for the LOCK and UNLOCK methods [v2] *[37f17a0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/37f17a0)*
* Fixed the tests for node.js:5 and node.js:4 *[b43ba41](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b43ba41)*
* Modified the tests to use 'server.rootFileSystem()' method instead of the removed 'server.rootFileSystem' property *[7c7874c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7c7874c)*
* Updated the test commands to compile the TypeScript, run the tests for the v2, then run the tests for the v2 *[3f6c274](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3f6c274)*
* Added tests for the lock/unlock methods (v2) *[70717b2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/70717b2)*
* Added tests for the OPTIONS method (v2) *[6e5981a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6e5981a)*
* Added tests for the readDir/propfind on a directory (v2) *[9ce23d1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9ce23d1)*
* Added tests for the read/write get/put methods (v2) *[b801535](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b801535)*
* Added tests for the server management (v2) *[735e2ed](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/735e2ed)*
* Added TypeScript tests for better test developments *[f5b48a7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f5b48a7)*
* Upgraded the test framework to be more clean and ease the making of new tests *[74c381c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/74c381c)*
* Splitted the 'test' folder into 'v1' and 'v2' *[ac88f11](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ac88f11)*

### Other
* Cleaned the code *[1a46154](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1a46154)*
* Updated the '@types/node' dev dependency *[6491270](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6491270)*
* Exported the 'PrivilegeManager' class and the 'SimplePathPrivilegeManager' class *[f258c99](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f258c99)*
* Added the 'Forbidden' standard error *[a209249](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a209249)*
* Implemented the lock check *[0b41e28](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0b41e28)*
* Implemented the privilege checks *[0b41e28](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0b41e28)*
* Removed the FTP packages in the npm dependencies *[3733df7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3733df7)*
* Removed the old files from when the v2 was contained in one file *[04762e9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/04762e9)*
* Removed the empty 'requirePrivilege' methods in the 'RequestContext' class *[8cf9a53](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8cf9a53)*
* Moved the 'FTPFileSystem' class to the '@webdav-server/ftp' package *[5c04125](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5c04125)*
* Exported the v1 within the v1 scope too *[1cc4a03](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1cc4a03)*
* Exported the v2 *[90a6556](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/90a6556)*
* Fixed Travis CI missing 'tsc' *[d4850b7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d4850b7)*
* Modified the 'tsconfig.json' file to make TypeScript compile with comments by default *[6e7acd8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6e7acd8)*
* Added the TS types for the 'request' package *[3f6c274](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3f6c274)*
* Added the 'ftp' package in the dependencies *[3f6c274](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3f6c274)*
* Updated the .gitignore to ignore the transcripted code folder in the tests *[e83b463](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e83b463)*

### Bug fix
* Fixed the 'VirtualFileSystem' unserialization *[d43f5c9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d43f5c9)*
* Fixed the urls in PROPFIND, PROPPATCH and LOCK responses not being encoded *[7bc8928](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7bc8928)*
* Added encoding for the url in the PROPPATCH and PROPFIND responses [v1] *[30d5bcc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/30d5bcc)*
* Fixed the 'SimplePathPrivilegeManager' implementation *[489cf28](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/489cf28)*
* Fixed the 'HTTPDigestAuthentication' implementation *[008af5c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/008af5c)*
* Changed the default namespace from 'DAV:' to nothing, allowing to keep out-of-namespace tags in the properties *[635ce3f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/635ce3f)*
* Fixed the 'VirtualFileSystem' *[9d3b03e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9d3b03e)*
* Fixed the MOVE method *[2c7a84c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2c7a84c)*
* Fixed the PROPFIND method *[2c7a84c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2c7a84c)*
* Fixed the response status when the parent was missing *[056df31](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/056df31)*
* Fixed the 'starter' method of the OPTIONS method tests to be more robust if some more tests are added in the future *[6fe546a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6fe546a)*
* Fixed the '_delete' method in the 'VirtualFileSystem' class which was not deleting the children of deleted folders *[e529f71](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e529f71)*
* Fixed an unserialization bug (returning undefined as the unserialized data) *[467e91c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/467e91c)*
* Fixed the serialization [v2] *[14b6e4c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/14b6e4c)*

# 1.9.1

### New features
* Implemented the physical gateway and its FSManager *[d0aa8c8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d0aa8c8)*
* Implemented the static methods 'standardMoveWithoutCopy', 'standardMoveByCopy', 'standardFindChildByName', 'standardFindChildren' and 'standardAddToParent' in the 'StandardResource' class *[2bb7a4b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2bb7a4b)*

### Changes
* Compiled the TypeScript code with comments :
  * *[e3fbf7a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e3fbf7a)*
  * *[94077ae](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/94077ae)*
* Use the 'standardMoveByCopy' in 'standardMoveTo' static method as a default behavior *[2bb7a4b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2bb7a4b)*
* Implemented a default method for 'moveTo' in the 'StandardResource' class *[2bb7a4b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2bb7a4b)*
* Removed the 'moveTo' method in the 'VirtualResource' class to use the default implementation in 'StandardResource' *[1a38d52](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1a38d52)*

### Documentation
* Added an example of a physical gateway *[9123bf6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9123bf6)*

### Tests
* Fixed a wrong test when a move is made by copy in the 'ResourceTester' class *[1b5e3a1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1b5e3a1)*
* Fixed the 'movePhysical' test *[48723ee](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/48723ee)*

### Other
* Fixed the package.json of the FTP gateway example *[d17ac14](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d17ac14)*

### Bug fix
* Fixed the FSManager uid in the FTP Gateway example *[00aed8c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/00aed8c)*
* Fixed the 'moveTo' method of the 'PhysicalResource' *[500eca5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/500eca5)*

# 1.9.0

### New features
* A 'FSManager.serialize(...)' returning 'undefined' or 'null' will lead to skip the serialization of the resource *[f5e06ae](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f5e06ae)*
* Added the 'finalSize' to the 'write(...)' method of resources when available :
  * *[a58d38f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a58d38f)*
  * *[8d4df3e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8d4df3e)*
* Added a 'MustIgnore' error which can make the server to skip some checks (mostly lock tests) :
  * *[aa8a629](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa8a629)*
  * *[ccb786e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ccb786e)*
  * *[a58d38f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a58d38f)*
* Added the ability to a resource to provide its own sub-tree based on the requested path (Gateway) :
  * *[485b270](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/485b270)*
  * *[a58d38f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a58d38f)*
  * *[05fd08c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/05fd08c)*

### Changes
* Cleaned the code *[d55ab4d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d55ab4d)*
* The user is now optional for lock creation leading to skip the user checking when testing the user privileges :
  * *[2c89532](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2c89532)*
  * *[0a9ca37](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0a9ca37)*
* Added the 'XMLElement' methods 'findText() : string' and 'findTexts() : string[]' *[164022b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/164022b)*
* Now export the 'XML', 'IfParser' and 'Workflow' to allow easier resource/FSManager creation :
  * *[55c71b3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/55c71b3)*
  * *[585b172](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/585b172)*

### Documentation
* Added an example for the gateway : FTP Gateway *[45f1055](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/45f1055)*
* Added the Gitter link to the README *[dbbfb12](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/dbbfb12)*

### Tests
* Fixed a broken test with the 'DAV:lockdiscovery' *[9d5b3c9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9d5b3c9)*

### Other
* Improved the XML 'name to namespace' feature *[164022b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/164022b)*

### Bug fix
* Fixed the 'moveTo(...)' which was calling the the 'rename(...)' method even when the oldName and newName were equal *[05fd08c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/05fd08c)*
* Fixed ResourceTester error *[083a5c0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/083a5c0)*
* Modified the 'FSPath' to remove '//' sequences ('//' => '/') *[0315270](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0315270)*
* Fixed the example of the Custom Web Resource, which was not loading the 'webdav-server' module but the 'lib/index.js' of the root folder *[00661a0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/00661a0)*

# 1.8.2

### New features
* Implemented an 'autoLoad' method in the server to help loading files saved by the 'autoSave' *[5acdf13](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5acdf13)*
* Added the static method 'loadFromPath(...)' in the 'PhysicalFolder' class to allow easy resource tree loading based on a url *[b8c5ca0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b8c5ca0)*

### Documentation
* Used the 'autoLoad' method to load the content in the 'customWebResource' example *[f0365f2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f0365f2)*
* Added the 'loadPhysicalFolder' example *[7ed6c7a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7ed6c7a)*
* Added the 'examples' folder in the list of links in the README *[595bcf1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/595bcf1)*
* Fixed the 'Custom Web Resource' example *[d9b3761](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d9b3761)*

### Other
* Upgraded the 'webdav-server' version needed in the example 'customWebResource' to 1.8.2 *[9af7d93](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9af7d93)*
* Moved the 'autoSave' signature (in the server options) to an external interface *[fcb22cf](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fcb22cf)*

### Bug fix
* Fixed the wrong signature of the 'autoSave.streamProvider' server option *[d80491a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d80491a)*

# 1.8.1

### Documentation
* Added an example folder to provide real/full examples *[14cdf33](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/14cdf33)*
* Added the example : Custom Web Resource *[14cdf33](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/14cdf33)*
* Replaced test from the 'Project information' section in the README by a list of links *[be2c77a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/be2c77a)*

### Other
* Implemented the lock tests for the 'ResourceTester' *[cb90c9f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/cb90c9f)*
* Added a missing option for the 'ResourceTester' *[b007f28](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b007f28)*
* Fixed code format *[40dba6b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/40dba6b)*
* Removed useless exports from 'BeforeAfter.ts' file *[be66fb5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/be66fb5)*

### Bug fix
* Fixed a bug when a resource added to the server had no fsManager (= volatile resource) *[3c4cd72](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3c4cd72)*
* Fixed a timeout error for the locks *[6097857](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6097857)*

# 1.8.0

### New features
* Added the ability to parse JSON in the request body *[cf0debb](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/cf0debb)*
* Added the 'Allow' header to all the methods and filter the allowed methods according to the existence of the requested resource and its 'ResourceType' *[7db537e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7db537e)*
* Added the server options 'serverName' and 'version' to display in the 'Server' HTTP header *[fd4158b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fd4158b)*
* Added the 'Server' header to the responses *[e015847](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e015847)*
* Added a 'displayName' optional method in the 'IResource' interface *[c9812d6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c9812d6)*

### Changes
* Moved the 'Allow' response header from the 'OPTIONS' method to all the methods *[e015847](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e015847)*
* Use the 'displayName' method when available as text for the 'DAV:displayname' XML element in the PROPFIND response body *[c9812d6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c9812d6)*
* Removed the 'setName' parameter of the 'StandardResource.standardMoveTo(...)' static method to use instead the 'IResource.rename(...)' method *[c3f8b6a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c3f8b6a)*
* Removed the unused 'isOnTheSameFSWith' and 'isSame' methods of the 'IResource' interface *[8660bbf](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8660bbf)*

### Tests
* Added tests for the JSON in the request body *[84bd1c9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/84bd1c9)*
* Added tests for the 'Overwrite' header for the 'MOVE' method *[4be3904](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4be3904)*

### Other
* Added a new helper : 'StandardResource.standardMimeType(...)' *[695a93a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/695a93a)*

### Bug fix
* Fixed the '404' status always in the responses of the 'PROPRFIND' method even when empty *[f1243e7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f1243e7)*
* Fixed the overwrite behavior in the 'StandardResource.standardMoveTo' static method *[8b1caad](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8b1caad)*

# 1.7.4

### Documentation
* Changed the code type from 'typescript' to 'javascript' of the code sample in the README *[34a19f1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/34a19f1)*

### Tests
* Added tests for the streaming PUT *[ae0cf70](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ae0cf70)*

### Bug fix
* Changed the behavior of the server regarding the 'Content-Length' header in order to use the chunked version of a method everytime *[0b675b0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0b675b0)*

# 1.7.3

### New features
* Added support to HTTPS *[4781457](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4781457)*

### Changes
* The 'mimeType' method of the implemented resources now return the content type instead of the mime-type only *[d1247af](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d1247af)*

### Documentation
* Simplified the README.md *[0bc3801](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0bc3801)*

### Other
* Added a 'Workflow' class to replace similar codes in the project *[eb22a3d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/eb22a3d)*

### Bug fix
* Added the 'Content-Type' and the 'Content-Length' headers to the GET and HEAD methods *[787ed4e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/787ed4e)*

# 1.7.2

### Tests
* Removed support for the unstable version 4.0 version of node *[418332a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/418332a)*

### Other
* Added a way to add new XML elements at the head of the perent's children in the XML file utility *[310b860](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/310b860)*

### Bug fix
* Now write 'DAV:href' at the head of the parent's children, fixing issues with 'cadaver', 'davfs2', etc... *[9d9d512](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9d9d512)*

# 1.7.1

### Tests
* Improved the tests for the 'source' and 'translate' headers *[b99024b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b99024b)*

### Bug fix
* Fixed a bug with the 'translate' header *[ccdd7ed](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ccdd7ed)*

# 1.7.0

### New features
* Added resource events in the system *[83bb59e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/83bb59e)*
* Added an 'autoSave' mode to the server to embed a robust way to save the state of the server *[bd2f12f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd2f12f)*
* Implemented a 'SimplePathPrivilegeManager' to manage easily user privileges (pretty bare) *[b5b81f3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b5b81f3)*
* Changed the response code/message (to 401 Unauthorized) to ask the client to authenticate the user *[14e7c76](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/14e7c76)*
* Added the 'all' privilege in the 'BasicPrivilege' type *[318e526](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/318e526)*
* Added support for the 'translate' header (alias of the 'source' header) *[2d9627e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2d9627e)*
* Added support for ranged GET requests *[5bee991](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5bee991)*

### Changes
* Use the 'HTTPDigestAuthentication' instance by default instead of a 'HTTPBasicAuthentication' instance in the server's options *[0795df3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0795df3)*
* Changed 'addUser' of the 'SimpleUserManager' class to return the created user *[155ea74](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/155ea74)*
* Added the 'Content-Length' header and the 'Accept-Ranges' header in the HEAD method *[992620b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/992620b)*
* Added the 'DAV:location' tag to the propfind response *[3df40bb](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3df40bb)*

### Tests
* Use a 'HTTPBasicAuthentication' as a default authentication system for tests *[dde8001](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/dde8001)*
* Added tests for the server events *[759befc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/759befc)*
* Added tests for the 'translate' header *[30ea0d3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/30ea0d3)*

### Other
* Added a 'SimpleBasicPrivilege' type to represent the possibilities of the 'SimplePrivilegeManager' classes *[218af11](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/218af11)*
* Added the 'MethodCallArgs' type to a function definition (for better code clarity) *[2175459](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2175459)*
* Added the export of the 'SimplePathPrivilegeManager' class *[b6548aa](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b6548aa)*
* Added the 'autoSave' option *[eef40f0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/eef40f0)*
* Removed duplicates in the code of the 'ResourceTester' class *[b254f51](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b254f51)*
* Changed the order of the imports to be more stable on future changes *[0ad2594](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0ad2594)*
* Removed useless imports/exports which could cause circular dependencies *[4e14885](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4e14885)*
* Centralized the 'source' header check in the 'MethodCallArgs' class *[163914f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/163914f)*

### Bug fix
* Changed the Unlock response status code/message when unauthorized (to 403 Forbidden) *[65423c8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/65423c8)*
* Fixed bugs in the 'HTTPBasicAuthentication' and the 'HTTPDigestAuthentication' classes *[4e8c78c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4e8c78c)*
* Fixed PROPPATCH and PROPFIND xml parsing errors when the request body was not valid *[e7fed58](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e7fed58)*

## 1.6.0

### New features
* Now PROPFIND can filter properties depending on the request body (according to the RFC) *[7af0e36](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7af0e36)*
* Added a 'strictMode' to let more flexibilities to the communications client/server

### Changes
* Added the 'DAV' header with the values '1,2' => class 1 + 2 supported (RFC) *[27abc4e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/27abc4e)*
* Add a trailing '/' to the resource path of collections (folders) in the 'DAV:href' tag (response) *[7af0e36](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7af0e36)*
* Removed the 'DAV' in the OPTION method file to provide it to all responses *[63aa8a3](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/63aa8a3)*
* Added more compliance with the WebDAV RFC (body checking, errors returned, etc...) *[46cbef7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/46cbef7)*
* Added xmlns attribute for 'DAV:' presence in a tag name *[3bc3f07](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3bc3f07)*

### Documentation
* Added the 'strictMode' server option in the README *[24dd02b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/24dd02b)*

### Tests
* Removed useless test in the 'VirtualFSManager' class *[c4dc8db](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4dc8db)*

### Other
* Removed displays (console.log) *[efa5449](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/efa5449)*
* Removed tests for compliance in the PROPFIND method *[6298c65](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6298c65)*

### Bug fix
* Fixed a potential '//' at the end of the path of a resource *[27abc4e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/27abc4e)*
* Fixed an XML bug leading to an infinite loop *[3bc3f07](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3bc3f07)*
* Fixed the issue of not applying to the name of XML elements the default namespace *[aa793d5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa793d5)*

## 1.5.5

### Bug fix
* Added missing exports *[e8aa467](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e8aa467)*

## 1.5.4

### Changes
* Added a local cache for lock discovery in PROPFIND *[bc744b0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bc744b0)*

### Tests
* Removed debug display in tests *[40fa39a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/40fa39a)*
* Fixed the way to get the lock-token from a LOCK response in the tests *[a745c95](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a745c95)*

### Bug fix
* Fixed recurrent size error in the Propfind method *[67d7485](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/67d7485)*
* Fixed negative values in the lock-token generation *[5ad148f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5ad148f)*

## 1.5.3

### Changes
* Now skip the tag 'owner' in the PROPFIND response when the lock has no owner content *[e3d81c8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e3d81c8)*

### Bug fix
* Fixed a bug when serializing a VirtualStoredFile having a content length of 0 *[c81190d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c81190d)*

## 1.5.2

### Bug fix
* Fixed unremoved resource from parent when calling 'delete' on a VirtualStoredFile *[a81a906](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a81a906)*

## 1.5.1

### Changes
* Added the content uid to the list of the arguments of the 'IVirtualStoredContentManagerMiddleware' methods *[4f9cbf1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4f9cbf1)*

## 1.5.0

### New features
* Implemented the new chunked version of the PUT method *[7f605b1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7f605b1)*
* Added the 'deallocate' method to the virtual stored resource management *[7506c3c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7506c3c)*
* Added a middleware for the 'SimpleVirtualStoredContentManager' class *[a322b75](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a322b75)*

### Changes
* Replaced the middleware 'stream.Writable' into a 'stream.Transform' for the VirtualStoredFile *[36bc500](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/36bc500)*
* Modified the HEAD method implementation to avoid the use of the 'read' method of the resources *[25d120b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/25d120b)*
* Removed the un/serialization of the locks in the FSManagers *[2786bea](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2786bea)*
* Now throw an Error when the 'SimpleVirtualStoredContentManager' instance is not initialized, helping for debugging *[c3eb727](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c3eb727)*
* The member 'managerUID' can now be accessed from outside of the error class 'ManagerNotFound' *[6378c48](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6378c48)*

### Other
* Splitted the 'WebDAVServer' class file into smaller files *[1f1d13c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1f1d13c)*
* Splitted the 'ResourceTester' class file into smaller files *[8f8af70](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8f8af70)*
* Added a dot (.) at the end of the text of each common error *[1daac87](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1daac87)*
* Used more standard errors *[155035c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/155035c)*

### Bug fix
* Added event inheritance in the 'VirtualStoredFile' class *[eaefedc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/eaefedc)*
* Cleaned the 'lib' folder *[e2e054c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e2e054c)*
* Added the un/serialization of the property 'contentUid' for the 'VirtualStoredFile' class *[62556f5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/62556f5)*
* Fixed CodeClimate issues (code formatting) *[325f30f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/325f30f)*

## 1.4.0

### New features
* Implemented a virtual stored resource, able to delegate its content to a content manager *[f3fff2b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f3fff2b)*
* Implemented a resource tester to make the resource development easier and more stable *[36414fc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/36414fc)*

### Changes
* Now return an error when requesting the size or mime-type of a virtual or physical folder *[12bdd45](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/12bdd45)*
* Added a UID for the IUser interface *[6c2b0be](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6c2b0be)*
* Use the UID of the user instead of the reference to compare the users *[6c2b0be](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6c2b0be)*
* Removed the 'canLock' and 'canRemoveLock' methods from the resources *[3902d35](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3902d35)*
* Implemented 'stream.Readable' and 'stream.Writable' for the 'write' and 'read' methods of resources instead of using a 'Int8Array' :
    * *[b88370a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b88370a)*
    * *[d6b1b3e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d6b1b3e)*

### Documentation
* Modified the sample in the README file to match the new 'write' method in the resources *[9f1b0f0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9f1b0f0)*

### Tests
* Added tests for the virtual stored resources using the resource tester *[cdd56d0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/cdd56d0)*
* Added ResourceTester tests for the virtual and physical resources *[aea18ee](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aea18ee)*
* Adapted the tests to the 'stream.Readable' and the 'stream.Writable' addings *[2d30e39](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2d30e39)*
* Increased the timeout value for the tests *[4f73875](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4f73875)*
* Modified the '*.content = *' into '*.write(...) in the tests *[b81f383](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b81f383)*

### Other
* Added the ResourceTester class to the resource exports *[92903ff](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/92903ff)*
* Standardized the 'moveTo' method of resources *[c6868fa](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c6868fa)*
* Modified the 'moveTo' method of the virtual and physical resources to be more reliable *[44b38fe](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/44b38fe)*
* Changed from 'dev-watch' to 'tsc' to compile *[9f1f60c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9f1f60c)*
* Added 'process.nextTick(...)' for the serialization helper *[cbaa8f6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/cbaa8f6)*

### Bug fix
* Fixed content un/serialization for virtual files *[0a41414](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0a41414)*
* Fixed XML error with the 'parse' function *[d96ea6d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d96ea6d)*

## 1.3.2

### New features
* Added the ability to switch to the chunked version of a command (method) when possible *[71c7073](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/71c7073)*
* Added the server option 'canChunk' *[6396a81](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6396a81)*
* Implemented the chunked version of the PUT method *[5923925](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5923925)*

### Documentation
* Added the server option 'canChunk' in the documentation *[470b15e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/470b15e)*

### Tests
* Added the tests for the chunked packets *[06b9c56](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/06b9c56)*

### Other
* Added the HTTPError class *[c60f5dd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c60f5dd)*
* Added the 'ExpectedAFileResourceType' standard error *[c60f5dd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c60f5dd)*

### Bug fix
* Fixed the error with the type Int8Array with the GET method *[7e942c2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7e942c2)*

## 1.3.1

### New features
* Implemented the callback on the start method *[880dd8a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/880dd8a)*
* Implemented the server option 'hostname' *[0ab2be2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0ab2be2)*
* Implemented DAV:lockdiscovery in PROPFIND *[9009ad1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9009ad1)*

### Changes
* Made the arguments of the start method optional *[880dd8a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/880dd8a)*
* Added a callback to the start method to 'synchronize' with the server opening *[e3eb1e0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e3eb1e0)*

### Documentation
* Modified the sample to use the callback on the start method *[4313cba](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4313cba)*
* Added the 'hostname' option in the documentation *[ef4a3c0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ef4a3c0)*

### Tests
* Implemented the server start callback in the whole tests *[609f855](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/609f855)*
* Added more tests for the start method *[516a7fb](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/516a7fb)*
* Fixed the try-catch of the PROPFIND method in the tests *[38630f5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/38630f5)*
* Added tests for copying the properties (COPY method) *[911029f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/911029f)*
* Added tests for moving the properties (MOVE method) *[7236e50](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7236e50)*
* Added tests for DAV:lockdiscovery *[2b9cde8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2b9cde8)*

### Bug fix
* Fixed callback error in the start method *[ca72e94](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ca72e94)*

## 1.3.0

### New features
* Implemented the method 'addResourceTree' in the server class to make the resource tree creation easier *[bda6e6c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bda6e6c)*
* Implemented the 'If' header check in all methods where it makes sense *[fab8388](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fab8388)*
* Added a refresh method to the Lock class *[e90274f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e90274f)*

### Changes
* Added 'process.nextTick(...)' when possible, except in resources to keep them simple *[17187bd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/17187bd)*

### Documentation
* Modified the sample to use the new way to create the resource tree (with 'addResourceTree') *[0beebbe](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0beebbe)*

### Tests
* Added tests for the 'addResourceTree' method *[1bf0c47](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1bf0c47)*
* Added the 'If' header test for the LOCK test *[c4d3ace](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4d3ace)*
* Added the tests for the Lock refresh *[c4d3ace](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4d3ace)*
* Added tests for the 'source' header *[8c79901](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8c79901)*

### Other
* Added a parser for the 'If' header *[e4e2208](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e4e2208)*

## 1.2.1

### Documentation
* Specified that the module is compatible from node v4.0.0 to latest *[bf4fd93](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bf4fd93)*

### Tests
* Test node v4.0 *[058106f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/058106f)*
* Do not support node v0.* *[d4be29c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d4be29c)*
* Upgraded tests syntax for node version 0.* *[f5f6b5c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f5f6b5c)*
* Reverted the node v0.* changes => not supporting v0.* anymore *[099d40b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/099d40b)*
* Test Travis on all versions of NodeJS *[39d1211](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/39d1211)*

### Bug fix
* Check if 'fs.constants.O_CREAT' exists for node v5.* and lower *[e23b5d7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e23b5d7)*

## 1.2.0

### New features
* Added parents lock check *[76f3340](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/76f3340)*
* Added 'source' header to read/write source of the files *[842b37a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/842b37a)*
* Added the 'canSource' privilege *[842b37a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/842b37a)*
* Implemented privilege check for most of the WebDAV methods *[e25fcbc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e25fcbc)*

### Changes
* Upgraded the PUT method *[c1259de](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c1259de)*
* Upgraded the LOCK method *[838c51b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/838c51b)*
* Changed the '401 Unauthorized' responses status for not allowed opertions to the '403 Forbidden' status *[e55460e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e55460e)*

### Documentation
* Changed interface body into full interface declaration in the documentation *[bd3c6d7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd3c6d7)*
* Added a comment to describe 'canSource' in the documentation *[7ff9fd9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7ff9fd9)*
* Added the 'canSource' privilege to the documentation *[a72147f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a72147f)*

### Tests
* Added a full range of tests for the UNLOCK method *[d2d5075](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d2d5075)*
* Upgraded the LOCK tests *[838c51b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/838c51b)*
* Upgraded the UNLOCK tests *[f4f1363](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f4f1363)*
* Added the 'date' header test *[5668628](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5668628)*

### Other
* Changed the 'override' word into 'overwrite' which makes more sense *[f3caaab](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f3caaab)*
* Removed useless comment *[8b5e8c8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8b5e8c8)*
* Converted 'new Error(...)' into the Error 'enum' *[b2c7bc2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b2c7bc2)*
* Removed useless TODO *[c65658e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c65658e)*

### Bug fix
* Added missing privilege check *[3cfdbea](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3cfdbea)*

## 1.1.1

### Other
* Fixed code format *[4526ad7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4526ad7)*

### Bug fix
* Fixed a some bugs about the persistence *[0d1c7c1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0d1c7c1)*

## 1.1.0

### New features
* Added persistence management (save and load the state of the server) *[b79a7ac](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b79a7ac)*

### Changes
* Implemented a RootFSManager for the RootResource *[6ce240c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6ce240c)*
* Added optional the resource name (null or undefined => empty string) *[e11644d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e11644d)*

### Documentation
* Added the persistence section in the documentation *[db11649](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/db11649)*

### Tests
* Added some tests for the persistence *[b3474da](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b3474da)*

### Other
* Removed forAll<T>(...) method *[5472621](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5472621)*
* Fixed code format *[60f521b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/60f521b)*

## 1.0.2

### Bug fix
* Fixed broken imports *[458400c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/458400c)*

## 1.0.1

### Changes
* Exported more classes *[116cc15](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/116cc15)*

### Documentation
* Added some documentation *[f431ca7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f431ca7)*
* Fixed '<' by '\<' in changelog *[b766363](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b766363)*

### Other
* Cleaned the project *[7245ee5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/7245ee5)*
* Used more restrictive imports in WebDAVServer.ts *[327bd78](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/327bd78)*
* Added export files in main folders of the project for better scallability *[66a61c4](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/66a61c4)*
* Added the RFC privileges but not integrated *[61b7865](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/61b7865)*

## 1.0.0

### New features
* Implemented LOCK and UNLOCK methods *[a76f555](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a76f555)*
* Implemented the User management *[5e7325a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5e7325a)*
* Implemented Basic and Digest HTTP authentication *[5e7325a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5e7325a)*
* Implemented the structure of the privilege management *[5e7325a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5e7325a)*
* Implemented some privilege/lock checkers *[5e7325a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5e7325a)*
* Can now convert multi ':' tag names into namespace when producing XML response *[3fbfb17](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3fbfb17)*
* Now check attributes to avoid namespace shortname collision when producing XML response *[87f7a68](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/87f7a68)*

### Changes
* Upgraded the lock management *[299e307](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/299e307)*
* Added some errors as standard errors for better error management *[8a051b2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8a051b2)*

### Documentation
* Updated the 'disclaimer' section *[364152e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/364152e)*
* Fixed bad alt value for npm badge *[3c54594](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3c54594)*

### Tests
* Updated the tests about XML responses *[af18fcd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/af18fcd)*
* Implemented tests for the Authentication *[2f02c2b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2f02c2b)*
* Implemented tests for the LOCK and UNLOCK methods *[43f934f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/43f934f)*

### Bug fix
* Fixed the '\<ns1>:\<ns2>:\<name>' error leading to 'x:\<ns2>:\<name> xmlns:x='\<ns1>' *[f3e15a4](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f3e15a4)*
* Fixed namespace creation on '\<namespace>:\<name>' tag names *[76d8bb0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/76d8bb0)*

## 0.5.2

### Documentation
* Added TypeScript types to package.json *[766088b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/766088b)*

### Bug fix
* Trying to fix CodeClimate and upgrading tslint rules :
    * *[3c8aff1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3c8aff1)*
    * *[e4293af](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e4293af)*
    * *[5c3ee3e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5c3ee3e)*
    * *[fd00e04](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fd00e04)*
    * *[bfca9b9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bfca9b9)*
    * *[4ad3676](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4ad3676)*
    * *[ac6fea6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ac6fea6)*

## 0.5.1

### Documentation
* Added what will be included in the future release *[6495a73](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6495a73)*

## 0.5.0

### New features
* Implemented the COPY method *[2f45f4b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2f45f4b)*

### Documentation
* Added the method COPY to the supported methods *[ccc310f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ccc310f)*

### Tests
* Cleaned tests with error-macro *[c167e14](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c167e14)*
* Added tests for the COPY method *[1629103](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1629103)*

### Other
* Cleaned imports on the PhysicalResource class *[5115994](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/5115994)*
* Added getChildPath() method to FSPath class *[d1053ec](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d1053ec)*

## 0.4.0

### New features
* Can now get a JSON response instead of a XML response depending on the `Accept` header :
    * *[952f217](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/952f217)*
    * *[24836fc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/24836fc)*
    * *[34dac98](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/34dac98)*
    * *[3ab05de](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3ab05de)*

### Changes
* Added a standard method for writing operation results (other than raw data) depending to the Accept header (XML or JSON) *[952f217](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/952f217)*
* Delegate response writing to the standard writing method in arg (MethodCallArgs) *[24836fc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/24836fc)*

### Tests
* Added tests for JSON and XML responses for PROPPATCH and PROPFIND *[3ab05de](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3ab05de)*

### Other
* Added JSON string production from XML string *[34dac98](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/34dac98)*
* Removed useless import from Options.ts *[4c50a08](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4c50a08)*
* Modified muteNodeNS function name to mutateNodeNS *[54b3bf6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/54b3bf6)*

## 0.3.0

### New features
* Implemented the MOVE method *[2cb0430](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2cb0430)*

### Documentation
* Added the MOVE method as supported methods *[b591429](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b591429)*

### Tests
* Added tests for PROPPATCH for physical resources and virtual folder *[e4982dd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e4982dd)*
* Added more PROPFIND tests *[a4c9e63](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a4c9e63)*
* Added tests for the MOVE method *[715fbbd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/715fbbd)*
* Cleaned the code of some tests *[49ba519](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/49ba519)*

### Other
* Removed deprecated dev dep. @types/xml-js *[d30d602](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d30d602)*
* Forbid the use of console.* *[c18bcfb](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c18bcfb)*
* Upgraded the rules for TS checking *[0ffc065](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0ffc065)*

### Bug fix
* Fixed divers bugs about PROPFIND *[031794c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/031794c)*
* Fixed changes of the move() method on the RootResource class *[27a4bc1](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/27a4bc1)*

## 0.2.1

### New features
* Added support for the PROPPATCH method *[df2be26](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/df2be26*
* Added XML support for resource properties *[c4f206e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4f206e*

### Changes
* Implemented PROPFIND with 'xml-js' *[87878cd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/87878cd*
* Moved XML management to 'xml-js' npm package *[0aea380](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0aea380*
* Added better ETag generator *[1506637](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1506637*

### Documentation
* Added the PROPPATCH to the supported methods *[719082f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/719082f*

### Tests
* Implemented tests with 'xml-js' *[15b0b97](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/15b0b97*
* Added PROPPATCH tests *[bd60886](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd60886*
* Added tests for ETag :
    * *[6071bc9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6071bc9*
    * For physical files *[6ef6350](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6ef6350*

### Other
* Added XML helper *[12d90e7](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/12d90e7*
* Added the child.delete() to the node execution queue *[9614be9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9614be9*
* Ignored *.log files *[a261eae](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a261eae*
* Changed node version for Travis *[0e47c3e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0e47c3e*

### Bug fix
* Updated lastModifiedDate when 'write' or 'append' methods called *[d5a5f9e](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d5a5f9e*
* Fixed double quotes for ETag *[36442c0](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/36442c0*
* Fixed deletion *[1a6bf99](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1a6bf99*
* Added .gitkeep to test folders *[b9c9ab2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b9c9ab2*

## 0.2.0

### New features
* Added support for the following methods :
    * OPTIONS *[2012d40](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2012d40)*
    * DELETE *[bb5fc2b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bb5fc2b)*
    * HEAD *[105580f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/105580f)*
    * POST (alias of PUT) *[3ab1441](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3ab1441)*
    * PUT *[3f11227](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3f11227)*

### Changes
* Changed HTTP status when the resource cannot be read *[d7c5192](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d7c5192)*

### Documentation
* Added the new methods as supported :
    * OPTIONS *[290a606](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/290a606)*
    * DELETE *[4381d12](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4381d12)*
    * HEAD *[105580f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/105580f)*
    * POST (alias of PUT) *[3ab1441](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3ab1441)*
    * PUT *[0313db9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0313db9)*
* Added a link to the RFC *[0313db9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0313db9)*

### Tests
* Added tests for the new methods :
    * OPTIONS *[2012d40](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2012d40)*
    * DELETE *[feb22d6](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/feb22d6)*
    * OPTIONS *[0533082](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0533082)*
    * HEAD *[105580f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/105580f)*
    * PUT *[a6bfb5a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a6bfb5a)*

### Other
* Added request as dev dep. *[08fe206](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/08fe206)*

### Bug fix
* Fixed delete bugs *[bb5fc2b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bb5fc2b)*
* Fixed the test *[fa90936](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/fa90936)*

## 0.1.3

### Bug fix
* Removed support for POST method *[98a75e5](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/98a75e5)*

### New features
* Added support for physical file/folder creation *[4edab34](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4edab34)*

### Documentation
* Added disclaimer *[10a5c2f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/10a5c2f)*

### Tests
* Added tests for the physical folder *[681caba](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/681caba)*
* Standarized the multiple tests in a single test file *[3cd3934](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/3cd3934)*
* Added GET method test for physical resources *[d40bba8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/d40bba8)*
* Filtered test files by *.js *[bd3488b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd3488b)*
* Added exception display *[592ee40](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/592ee40)*

### Other
* Splitted files into one-class files for most of them *[a341dac](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a341dac)*

## 0.1.2

### Bug fix
* Fixed Get method for files with a content equals to null or undefined *[dc7ff27](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/dc7ff27)*
* Added content validation before sending GET response *[269bcbf](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/269bcbf)*
* Fixed lint
    * Updated lint config *[f90437f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f90437f)*
    * Updated lint config *[b7a135a](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b7a135a)*
    * Updated lint config *[aa85405](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa85405)*
    * Updated lint config *[c006495](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c006495)*
    * Added tslint rules *[c4619c2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4619c2)*
    * Changed jslint to tslint *[bd8ad51](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd8ad51)*
* Fixed misspelling *[62badc8](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/62badc8)*

### Changes
* Centralized tslint config into tslint.json *[2edbce9](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2edbce9)*

### Documentation
* Added CHANGELOG.md to record the changelog *[e860486](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e860486)*
* Changed bitHound badge *[6ad7c8d](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6ad7c8d)*
* Added bitHound badge *[0dad206](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0dad206)*

### Tests
* Added more tests for the GET method *[1e8b1fd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1e8b1fd)*

### Other

* Cleaned the code *[4a06022](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4a06022)*
* Ignore tslint.json for git and npm *[ddeacd2](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ddeacd2)*
* Normalized tabs *[8e81091](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8e81091)*
* Added bitHound configuration *[44c84ff](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/44c84ff)*
* Added Hound config *[de1eb3b](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/de1eb3b)*

## 0.1.1

### New feature
* Now can inherit fsManager from parent *[a844417](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a844417)*
* Implemented a part of the PhysicalFSManager *[9cf0b9f](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9cf0b9f)*
* Exported WebDAVServerOptions *[0369cbd](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0369cbd)*

### Changes
* Removed the parent argument in resource constructors *[093a244](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/093a244)*
* Fixed FSManager.instance() call *[e475b08](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e475b08)*
* Added Singleton pattern for managers *[2ba4d2c](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2ba4d2c)*
* Made optional the 'parent' and 'fsManager' on constructor of resources -> parent is not affected on 'addChild()' call *[9c9a3bc](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9c9a3bc)*
* Made fsManager argument optional in constructors *[aa02333](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa02333)*

### Documentation
* Added some documentation *[c717169](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c717169)*

### Other
* Added git repository to package.json *[52abb55](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/52abb55)*


