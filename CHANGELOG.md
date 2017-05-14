# Changelog

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


