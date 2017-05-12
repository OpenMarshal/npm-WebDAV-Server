# Changelog

## Next release

### Bug fix
* Fixed Get method for files with a content equals to null or undefined *[*dc7ff27*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/dc7ff27)*
* Added content validation before sending GET response *[*269bcbf*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/269bcbf)*
* Fixed lint
    * Updated lint config *[*f90437f*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/f90437f)*
    * Updated lint config *[*b7a135a*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/b7a135a)*
    * Updated lint config *[*aa85405*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa85405)*
    * Updated lint config *[*c006495*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c006495)*
    * Added tslint rules *[*c4619c2*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c4619c2)*
    * Changed jslint to tslint *[*bd8ad51*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/bd8ad51)*
* Fixed misspelling *[*62badc8*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/62badc8)*

### Changes
* Centralized tslint config into tslint.json *[*2edbce9*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2edbce9)*

### Documentation
* Changed bitHound badge *[*6ad7c8d*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/6ad7c8d)*
* Added bitHound badge *[*0dad206*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0dad206)*

### Tests
* Added more tests for the GET method *[*1e8b1fd*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/1e8b1fd)*

### Other

* Cleaned the code *[*4a06022*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/4a06022)*
* Ignore tslint.json for git and npm *[*ddeacd2*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/ddeacd2)*
* Normalized tabs *[*8e81091*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/8e81091)*
* Added bitHound configuration *[*44c84ff*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/44c84ff)*
* Added Hound config *[*de1eb3b*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/de1eb3b)*

## 0.1.1

### New feature
* Now can inherit fsManager from parent *[*a844417*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/a844417)*
* Implemented a part of the PhysicalFSManager *[*9cf0b9f*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9cf0b9f)*
* Exported WebDAVServerOptions *[*0369cbd*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/0369cbd)*

### Changes
* Removed the parent argument in resource constructors *[*093a244*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/093a244)*
* Fixed FSManager.instance() call *[*e475b08*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/e475b08)*
* Added Singleton pattern for managers *[*2ba4d2c*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/2ba4d2c)*
* Made optional the 'parent' and 'fsManager' on constructor of resources -> parent is not affected on 'addChild()' call *[*9c9a3bc*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/9c9a3bc)*
* Made fsManager argument optional in constructors *[*aa02333*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/aa02333)*

### Documentation
* Added some documentation *[*c717169*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/c717169)*

### Other
* Added git repository to package.json *[*52abb55*](https://github.com/OpenMarshal/npm-WebDAV-Server/commit/52abb55)*


