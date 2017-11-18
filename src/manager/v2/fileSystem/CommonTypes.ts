import { ReturnCallback, SimpleCallback } from './CommonTypes'
import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { XMLElement } from 'xml-js-builder'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export type SimpleCallback = (error ?: Error) => void;
export type ReturnCallback<T> = (error ?: Error, data ?: T) => void;
export type Return2Callback<T1, T2> = (error ?: Error, data1 ?: T1, data2 ?: T2) => void;

export type ResourcePropertyValue = string | XMLElement | XMLElement[]

export interface PropertyAttributes
{
    [name : string] : string
}

export class ResourceType
{
    static File = new ResourceType(true, false)
    static Directory = new ResourceType(false, true)

    static Hybrid = new ResourceType(true, true)
    static NoResource = new ResourceType(false, false)

    constructor(public isFile : boolean, public isDirectory : boolean)
    { }
}

export type OpenWriteStreamMode = 'mustCreate' | 'canCreate' | 'mustExist' | 'canCreateIntermediates' | 'mustCreateIntermediates';

export interface SubTree
{
    [name : string] : ResourceType | SubTree | string | Buffer
}
