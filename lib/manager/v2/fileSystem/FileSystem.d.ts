/// <reference types="node" />
import { PrivilegeManagerInfo, AvailableLocksInfo, CopyInfo, CreateInfo, CreationDateInfo, DeleteInfo, DisplayNameInfo, ETagInfo, LastModifiedDateInfo, LockManagerInfo, MimeTypeInfo, MoveInfo, OpenReadStreamInfo, OpenWriteStreamInfo, PropertyManagerInfo, ReadDirInfo, RenameInfo, SizeInfo, TypeInfo } from './ContextInfo';
import { ResourceType, SimpleCallback, Return2Callback, ReturnCallback, SubTree, OpenWriteStreamMode } from './CommonTypes';
import { ISerializableFileSystem, FileSystemSerializer } from './Serialization';
import { BasicPrivilege, PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager';
import { FileSystemEvent, WebDAVServer } from '../../../server/v2/webDAVServer/WebDAVServer';
import { Readable, Writable } from 'stream';
import { IPropertyManager } from './PropertyManager';
import { ContextualFileSystem } from './ContextualFileSystem';
import { RequestContext } from '../../../server/v2/RequestContext';
import { ILockManager, ILockManagerAsync } from './LockManager';
import { LockKind } from '../../../resource/v2/lock/LockKind';
import { Resource } from './Resource';
import { Lock } from '../../../resource/v2/lock/Lock';
import { Path } from '../Path';
/**
 * File system which manage resources under its mounted path.
 *
 * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Custom-File-System-%5Bv2%5D
 */
export declare abstract class FileSystem implements ISerializableFileSystem {
    private __serializer;
    constructor(serializer: FileSystemSerializer);
    /**
     * Get the serializer.
     */
    serializer(): FileSystemSerializer;
    /**
     * Defines the serializer to use.
     *
     * @param serializer Serializer to use.
     */
    setSerializer(serializer: FileSystemSerializer): void;
    /**
     * Tell to not serialize this file system.
     */
    doNotSerialize(): void;
    /**
     * Wrap the file system with the context.
     *
     * @param ctx Context of the operation.
     */
    contextualize(ctx: RequestContext): ContextualFileSystem;
    /**
     * Wrap the file system with the context and a resource path.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    resource(ctx: RequestContext, path: Path): Resource;
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'errorCallback' is called, otherwise the 'callback' is called.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource is sure to not exist.
     * @param callback Callback to call when the resource might exists.
     */
    fastExistCheckEx(ctx: RequestContext, _path: Path | string, errorCallback: SimpleCallback, callback: () => void): void;
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'callback' is called, otherwise the 'errorCallback' is called.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource might exists.
     * @param callback Callback to call when the resource is sure to not exist.
     */
    fastExistCheckExReverse(ctx: RequestContext, _path: Path | string, errorCallback: SimpleCallback, callback: () => void): void;
    /**
     * Make a fast check if a resource exists.
     * This method will call '_fastExistCheck' if it is implemented or return 'true'.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns if the resource exists.
     */
    protected fastExistCheck(ctx: RequestContext, _path: Path | string, callback: (exists: boolean) => void): void;
    protected _fastExistCheck?(ctx: RequestContext, path: Path, callback: (exists: boolean) => void): void;
    /**
     * Create a new resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     */
    createAsync(ctx: RequestContext, path: Path | string, type: ResourceType): Promise<void>;
    /**
     * Create a new resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param createIntermediates Defines if the operation is allowed to create intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     */
    createAsync(ctx: RequestContext, path: Path | string, type: ResourceType, createIntermediates: boolean): Promise<void>;
    /**
     * Create a new resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param callback Returns an error if one occured.
     */
    create(ctx: RequestContext, path: Path | string, type: ResourceType, callback: SimpleCallback): void;
    /**
     * Create a new resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param createIntermediates Defines if the operation is allowed to create intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param callback Returns an error if one occured.
     */
    create(ctx: RequestContext, path: Path | string, type: ResourceType, createIntermediates: boolean, callback: SimpleCallback): void;
    protected _create?(path: Path, ctx: CreateInfo, callback: SimpleCallback): void;
    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     */
    etagAsync(ctx: RequestContext, path: Path | string): Promise<string>;
    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns the etag of the resource.
     */
    etag(ctx: RequestContext, _path: Path | string, callback: ReturnCallback<string>): void;
    protected _etag?(path: Path, ctx: ETagInfo, callback: ReturnCallback<string>): void;
    /**
     * Delete a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    deleteAsync(ctx: RequestContext, path: Path | string): Promise<void>;
    /**
     * Delete a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param depth Depth of the delete. Might be ignored depending on the implementation.
     */
    deleteAsync(ctx: RequestContext, path: Path | string, depth: number): Promise<void>;
    /**
     * Delete a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns an error if one occured.
     */
    delete(ctx: RequestContext, path: Path | string, callback: SimpleCallback): void;
    /**
     * Delete a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param depth Depth of the delete. Might be ignored depending on the implementation.
     * @param callback Returns an error if one occured.
     */
    delete(ctx: RequestContext, path: Path | string, depth: number, callback: SimpleCallback): void;
    protected _delete?(path: Path, ctx: DeleteInfo, callback: SimpleCallback): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, targetSource: boolean): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, targetSource: boolean, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, targetSource: boolean): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, targetSource: boolean, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, targetSource: boolean, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, targetSource: boolean, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, targetSource: boolean, callback: Return2Callback<Writable, boolean>): void;
    /**
     * Open a stream to write the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx: RequestContext, path: Path | string, mode: OpenWriteStreamMode, targetSource: boolean, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    protected _openWriteStream?(path: Path, ctx: OpenWriteStreamInfo, callback: ReturnCallback<Writable>): void;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    openReadStreamAsync(ctx: RequestContext, path: Path | string): Promise<Readable>;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to read.
     */
    openReadStreamAsync(ctx: RequestContext, path: Path | string, estimatedSize: number): Promise<Readable>;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openReadStreamAsync(ctx: RequestContext, path: Path | string, targetSource: boolean): Promise<Readable>;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to read.
     */
    openReadStreamAsync(ctx: RequestContext, path: Path | string, targetSource: boolean, estimatedSize: number): Promise<Readable>;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the stream.
     */
    openReadStream(ctx: RequestContext, path: Path | string, callback: ReturnCallback<Readable>): void;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to read.
     * @param callback Returns the stream.
     */
    openReadStream(ctx: RequestContext, path: Path | string, estimatedSize: number, callback: ReturnCallback<Readable>): void;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openReadStream(ctx: RequestContext, path: Path | string, targetSource: boolean, callback: ReturnCallback<Readable>): void;
    /**
     * Open a stream to read the content of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to read.
     * @param callback Returns the stream.
     */
    openReadStream(ctx: RequestContext, path: Path | string, targetSource: boolean, estimatedSize: number, callback: ReturnCallback<Readable>): void;
    protected _openReadStream?(path: Path, ctx: OpenReadStreamInfo, callback: ReturnCallback<Readable>): void;
    /**
     * Move a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     */
    moveAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string): Promise<boolean>;
    /**
     * Move a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param overwrite
     */
    moveAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean): Promise<boolean>;
    /**
     * Move a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    move(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, callback: ReturnCallback<boolean>): void;
    /**
     * Move a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param overwrite
     * @param callback Returns if the resource has been owerwritten.
     */
    move(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    protected _move?(pathFrom: Path, pathTo: Path, ctx: MoveInfo, callback: ReturnCallback<boolean>): void;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     */
    copyAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string): Promise<boolean>;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param depth Depth to make the copy. (Infinite = -1)
     */
    copyAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, depth: number): Promise<boolean>;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite
     */
    copyAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean): Promise<boolean>;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite
     * @param depth Depth to make the copy. (Infinite = -1)
     */
    copyAsync(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean, depth: number): Promise<boolean>;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, callback: ReturnCallback<boolean>): void;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param depth Depth to make the copy. (Infinite = -1)
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, depth: number, callback: ReturnCallback<boolean>): void;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    /**
     * Copy a resource.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite
     * @param depth Depth to make the copy. (Infinite = -1)
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx: RequestContext, pathFrom: Path | string, pathTo: Path | string, overwrite: boolean, depth: number, callback: ReturnCallback<boolean>): void;
    protected _copy?(pathFrom: Path, pathTo: Path, ctx: CopyInfo, callback: ReturnCallback<boolean>): void;
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     */
    renameAsync(ctx: RequestContext, pathFrom: Path | string, newName: string): Promise<boolean>;
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param overwrite
     */
    renameAsync(ctx: RequestContext, pathFrom: Path | string, newName: string, overwrite: boolean): Promise<boolean>;
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    rename(ctx: RequestContext, pathFrom: Path | string, newName: string, callback: ReturnCallback<boolean>): void;
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     *
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param overwrite
     * @param callback Returns if the resource has been owerwritten.
     */
    rename(ctx: RequestContext, pathFrom: Path | string, newName: string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    protected _rename?(pathFrom: Path, newName: string, ctx: RenameInfo, callback: ReturnCallback<boolean>): void;
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    mimeTypeAsync(ctx: RequestContext, path: Path | string): Promise<string>;
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    mimeTypeAsync(ctx: RequestContext, path: Path | string, targetSource: boolean): Promise<string>;
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the mime type and the encoding of the resource.
     */
    mimeType(ctx: RequestContext, path: Path | string, callback: ReturnCallback<string>): void;
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the mime type and the encoding of the resource.
     */
    mimeType(ctx: RequestContext, path: Path | string, targetSource: boolean, callback: ReturnCallback<string>): void;
    protected _mimeType?(path: Path, ctx: MimeTypeInfo, callback: ReturnCallback<string>): void;
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    sizeAsync(ctx: RequestContext, path: Path | string): Promise<number>;
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    sizeAsync(ctx: RequestContext, path: Path | string, targetSource: boolean): Promise<number>;
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the size of the resource.
     */
    size(ctx: RequestContext, path: Path | string, callback: ReturnCallback<number>): void;
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the size of the resource.
     */
    size(ctx: RequestContext, path: Path | string, targetSource: boolean, callback: ReturnCallback<number>): void;
    protected _size?(path: Path, ctx: SizeInfo, callback: ReturnCallback<number>): void;
    /**
     * Get the list of available lock kinds.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    availableLocksAsync(ctx: RequestContext, path: Path | string): Promise<LockKind[]>;
    /**
     * Get the list of available lock kinds.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the list of available lock kinds.
     */
    availableLocks(ctx: RequestContext, path: Path | string, callback: ReturnCallback<LockKind[]>): void;
    protected _availableLocks?(path: Path, ctx: AvailableLocksInfo, callback: ReturnCallback<LockKind[]>): void;
    /**
     * Get the lock manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    lockManagerAsync(ctx: RequestContext, path: Path | string): Promise<ILockManagerAsync>;
    /**
     * Get the lock manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the lock manager of the resource.
     */
    lockManager(ctx: RequestContext, path: Path | string, callback: ReturnCallback<ILockManagerAsync>): void;
    protected abstract _lockManager(path: Path, ctx: LockManagerInfo, callback: ReturnCallback<ILockManager>): void;
    /**
     * Get the property manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    propertyManagerAsync(ctx: RequestContext, path: Path | string): Promise<IPropertyManager>;
    /**
     * Get the property manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the property manager of the resource.
     */
    propertyManager(ctx: RequestContext, path: Path | string, callback: ReturnCallback<IPropertyManager>): void;
    protected abstract _propertyManager(path: Path, ctx: PropertyManagerInfo, callback: ReturnCallback<IPropertyManager>): void;
    /**
     * Get the list of children of a resource.
     * Excludes the external resources, such as file systems mounted as child.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    readDirAsync(ctx: RequestContext, path: Path | string): Promise<string[]>;
    /**
     * Get the list of children of a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param retrieveExternalFiles Define if it must include the resources out of the file system, like other file systems mounted as child.
     */
    readDirAsync(ctx: RequestContext, path: Path | string, retrieveExternalFiles: boolean): Promise<string[]>;
    /**
     * Get the list of children of a resource.
     * Excludes the external resources, such as file systems mounted as child.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the list of children (file name) of the resource.
     */
    readDir(ctx: RequestContext, path: Path | string, callback: ReturnCallback<string[]>): void;
    /**
     * Get the list of children of a resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param retrieveExternalFiles Define if it must include the resources out of the file system, like other file systems mounted as child.
     * @param callback Returns the list of children (file name) of the resource.
     */
    readDir(ctx: RequestContext, path: Path | string, retrieveExternalFiles: boolean, callback: ReturnCallback<string[]>): void;
    protected _readDir?(path: Path, ctx: ReadDirInfo, callback: ReturnCallback<string[] | Path[]>): void;
    protected static neutralizeEmptyDate(date: number, defaultDate?: number): number;
    protected static neutralizeEmptyDateCallback: (callback: ReturnCallback<number>) => ReturnCallback<number>;
    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    creationDateAsync(ctx: RequestContext, path: Path | string): Promise<number>;
    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the creation date of the resource.
     */
    creationDate(ctx: RequestContext, path: Path | string, callback: ReturnCallback<number>): void;
    protected _creationDate?(path: Path, ctx: CreationDateInfo, callback: ReturnCallback<number>): void;
    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    lastModifiedDateAsync(ctx: RequestContext, path: Path | string): Promise<number>;
    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the last modified date of the resource.
     */
    lastModifiedDate(ctx: RequestContext, path: Path | string, callback: ReturnCallback<number>): void;
    protected _lastModifiedDate?(path: Path, ctx: LastModifiedDateInfo, callback: ReturnCallback<number>): void;
    /**
     * Get the name of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    webNameAsync(ctx: RequestContext, path: Path | string): Promise<string>;
    /**
     * Get the name of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the name of the resource.
     */
    webName(ctx: RequestContext, path: Path | string, callback: ReturnCallback<string>): void;
    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    displayNameAsync(ctx: RequestContext, path: Path | string): Promise<string>;
    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the 'displayName' information of the resource.
     */
    displayName(ctx: RequestContext, path: Path | string, callback: ReturnCallback<string>): void;
    protected _displayName?(path: Path, ctx: DisplayNameInfo, callback: ReturnCallback<string>): void;
    /**
     * Get the type of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    typeAsync(ctx: RequestContext, path: Path | string): Promise<ResourceType>;
    /**
     * Get the type of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the type of the resource.
     */
    type(ctx: RequestContext, path: Path | string, callback: ReturnCallback<ResourceType>): void;
    protected abstract _type(path: Path, ctx: TypeInfo, callback: ReturnCallback<ResourceType>): void;
    /**
     * Add a sub-tree to the file system at the root.
     *
     * @param ctx Context of the operation.
     * @param subTree Sub-tree to add.
     */
    addSubTreeAsync(ctx: RequestContext, subTree: SubTree): Promise<void>;
    /**
     * Add a resource to the file system as root.
     *
     * This method is equivalent to the 'fs.create(ctx, '/', resourceType, callback)' method.
     *
     * @param ctx Context of the operation.
     * @param resourceType Type of the resource to add.
     */
    addSubTreeAsync(ctx: RequestContext, resourceType: ResourceType | string | Buffer): Promise<void>;
    /**
     * Add a sub-tree to the file system.
     *
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the sub-tree.
     * @param subTree Sub-tree to add.
     */
    addSubTreeAsync(ctx: RequestContext, rootPath: Path | string, subTree: SubTree): Promise<void>;
    /**
     * Add a resource to the file system.
     *
     * This method is equivalent to the 'fs.create(ctx, rootPath, resourceType, callback)' method.
     *
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the resource.
     * @param resourceType Type of the resource to add.
     */
    addSubTreeAsync(ctx: RequestContext, rootPath: Path | string, resourceType: ResourceType | string | Buffer): Promise<void>;
    /**
     * Add a sub-tree to the file system at the root.
     *
     * @param ctx Context of the operation.
     * @param subTree Sub-tree to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx: RequestContext, subTree: SubTree, callback: SimpleCallback): void;
    /**
     * Add a resource to the file system as root.
     *
     * This method is equivalent to the 'fs.create(ctx, '/', resourceType, callback)' method.
     *
     * @param ctx Context of the operation.
     * @param resourceType Type of the resource to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx: RequestContext, resourceType: ResourceType | string | Buffer, callback: SimpleCallback): void;
    /**
     * Add a sub-tree to the file system.
     *
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the sub-tree.
     * @param subTree Sub-tree to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx: RequestContext, rootPath: Path | string, subTree: SubTree, callback: SimpleCallback): void;
    /**
     * Add a resource to the file system.
     *
     * This method is equivalent to the 'fs.create(ctx, rootPath, resourceType, callback)' method.
     *
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the resource.
     * @param resourceType Type of the resource to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx: RequestContext, rootPath: Path | string, resourceType: ResourceType | string | Buffer, callback: SimpleCallback): void;
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     *
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     */
    listDeepLocksAsync(ctx: RequestContext, startPath: Path | string): Promise<{
        [path: string]: Lock[];
    }>;
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     *
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param depth Depth to filter out-of-range locks (default = 0) (Infinite = -1).
     */
    listDeepLocksAsync(ctx: RequestContext, startPath: Path | string, depth: number): Promise<{
        [path: string]: Lock[];
    }>;
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     *
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param callback Returns an object { path: lock[] }.
     */
    listDeepLocks(ctx: RequestContext, startPath: Path | string, callback: ReturnCallback<{
        [path: string]: Lock[];
    }>): any;
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     *
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param depth Depth to filter out-of-range locks (default = 0) (Infinite = -1).
     * @param callback Returns an object { path: lock[] }.
     */
    listDeepLocks(ctx: RequestContext, startPath: Path | string, depth: number, callback: ReturnCallback<{
        [path: string]: Lock[];
    }>): any;
    /**
     * Get the root based file system path. This can also be understood as getting the mount path of the file system.
     *
     * @param ctx Context of the operation.
     */
    getFullPathAsync(ctx: RequestContext): Promise<Path>;
    /**
     * Get the root based path.
     *
     * @example If the file system is mounted on '/folder1', resolving '/folder2/folder3' will result to '/folder1/folder2/folder3'.
     *
     * @param ctx Context of the operation.
     * @param path Path to resolve.
     */
    getFullPathAsync(ctx: RequestContext, path: Path | string): Promise<Path>;
    /**
     * Get the root based file system path. This can also be understood as getting the mount path of the file system.
     *
     * @param ctx Context of the operation.
     * @param callback Returns the full path (root based).
     */
    getFullPath(ctx: RequestContext, callback: ReturnCallback<Path>): void;
    /**
     * Get the root based path.
     *
     * @example If the file system is mounted on '/folder1', resolving '/folder2/folder3' will result to '/folder1/folder2/folder3'.
     *
     * @param ctx Context of the operation.
     * @param path Path to resolve.
     * @param callback Returns the root based path.
     */
    getFullPath(ctx: RequestContext, path: Path | string, callback: ReturnCallback<Path>): void;
    /**
     * From the global paths (root based), retrieve the file system local paths (file system based).
     *
     * @example If the file system is mounted on '/folder1', the path '/folder1/folder2/folder3' will be returned as '/folder2/folder3'.
     * @param ctx Context of the operation.
     * @param fullPath The path or the list of paths to localize in the file system.
     */
    localizeAsync(ctx: RequestContext, fullPath: Path): Promise<Path[]>;
    localizeAsync(ctx: RequestContext, fullPath: Path[]): Promise<Path[]>;
    localizeAsync(ctx: RequestContext, fullPath: string): Promise<Path[]>;
    localizeAsync(ctx: RequestContext, fullPath: string[]): Promise<Path[]>;
    localizeAsync(ctx: RequestContext, fullPath: (string | Path)[]): Promise<Path[]>;
    /**
     * From the global paths (root based), retrieve the file system local paths (file system based).
     *
     * @example If the file system is mounted on '/folder1', the path '/folder1/folder2/folder3' will be returned as '/folder2/folder3'.
     * @param ctx Context of the operation.
     * @param fullPath The path or the list of paths to localize in the file system.
     * @param callback Returns the list of local paths.
     */
    localize(ctx: RequestContext, fullPath: Path, callback: ReturnCallback<Path[]>): any;
    localize(ctx: RequestContext, fullPath: Path[], callback: ReturnCallback<Path[]>): any;
    localize(ctx: RequestContext, fullPath: string, callback: ReturnCallback<Path[]>): any;
    localize(ctx: RequestContext, fullPath: string[], callback: ReturnCallback<Path[]>): any;
    localize(ctx: RequestContext, fullPath: (string | Path)[], callback: ReturnCallback<Path[]>): any;
    /**
     * Check if the user in the current context (ctx) has ALL privileges requested.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param privilege Privilege or list of privileges to check.
     */
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privilege: BasicPrivilege): Promise<boolean>;
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privileges: BasicPrivilege[]): Promise<boolean>;
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privilege: string): Promise<boolean>;
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privileges: string[]): Promise<boolean>;
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privileges: BasicPrivilege | BasicPrivilege[]): Promise<boolean>;
    checkPrivilegeAsync(ctx: RequestContext, path: Path | string, privileges: string | string[]): Promise<boolean>;
    /**
     * Check if the user in the current context (ctx) has ALL privileges requested.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param privilege Privilege or list of privileges to check.
     * @param callback Returns if the current user has ALL of the privileges.
     */
    checkPrivilege(ctx: RequestContext, path: Path | string, privilege: BasicPrivilege, callback: ReturnCallback<boolean>): any;
    checkPrivilege(ctx: RequestContext, path: Path | string, privileges: BasicPrivilege[], callback: ReturnCallback<boolean>): any;
    checkPrivilege(ctx: RequestContext, path: Path | string, privilege: string, callback: ReturnCallback<boolean>): any;
    checkPrivilege(ctx: RequestContext, path: Path | string, privileges: string[], callback: ReturnCallback<boolean>): any;
    checkPrivilege(ctx: RequestContext, path: Path | string, privileges: BasicPrivilege | BasicPrivilege[], callback: ReturnCallback<boolean>): any;
    checkPrivilege(ctx: RequestContext, path: Path | string, privileges: string | string[], callback: ReturnCallback<boolean>): any;
    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    privilegeManagerAsync(ctx: RequestContext, path: Path | string): Promise<PrivilegeManager>;
    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the privilege manager representing the requested resource.
     */
    privilegeManager(ctx: RequestContext, path: Path | string, callback: ReturnCallback<PrivilegeManager>): void;
    protected _privilegeManager?(path: Path, info: PrivilegeManagerInfo, callback: ReturnCallback<PrivilegeManager>): any;
    /**
     * Get if a resource is locked by another user than the one in the context argument or if the user has rights to write to the resource.
     * If the user has locked the resource and there is no conflicting lock, so the resource is considered as "not locked".
     * If the user didn't locked the resource and is not administrator, then the resource is considered as "locked".
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    isLockedAsync(ctx: RequestContext, path: Path | string): Promise<boolean>;
    isLockedAsync(ctx: RequestContext, path: Path | string, depth: number): Promise<boolean>;
    /**
     * Get if a resource is locked by another user than the one in the context argument or if the user has rights to write to the resource.
     * If the user has locked the resource and there is no conflicting lock, so the resource is considered as "not locked".
     * If the user didn't locked the resource and is not administrator, then the resource is considered as "locked".
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns if the resource is locked or not (true = locked, cannot write to it ; false = not locked) or returns an error.
     */
    isLocked(ctx: RequestContext, path: Path | string, callback: ReturnCallback<boolean>): any;
    isLocked(ctx: RequestContext, path: Path | string, depth: number, callback: ReturnCallback<boolean>): any;
    /**
     * Serialize the file system based on the 'this.serializer()' value.
     */
    serializeAsync(): Promise<any>;
    /**
     * Serialize the file system based on the 'this.serializer()' value.
     *
     * @param callback Returns the serialized data or an error.
     */
    serialize(callback: ReturnCallback<any>): void;
    /**
     * Attach a listener to an event.
     *
     * @param server Server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(server: WebDAVServer, event: FileSystemEvent, listener: (ctx: RequestContext, path: Path, data?: any) => void): this;
    /**
     * Attach a listener to an event.
     *
     * @param server Server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(server: WebDAVServer, event: string, listener: (ctx: RequestContext, path: Path, data?: any) => void): this;
    /**
     * Attach a listener to an event.
     *
     * @param ctx Context containing the server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(ctx: RequestContext, event: FileSystemEvent, listener: (ctx: RequestContext, path: Path, data?: any) => void): this;
    /**
     * Attach a listener to an event.
     *
     * @param ctx Context containing the server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(ctx: RequestContext, event: string, listener: (ctx: RequestContext, path: Path, data?: any) => void): this;
    /**
     * Trigger an event.
     *
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param path Path of the resource on which the event happened.
     */
    emit(event: string, ctx: RequestContext, path: Path | string, data?: any): void;
}
