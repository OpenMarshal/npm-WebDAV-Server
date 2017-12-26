import { MethodCallArgs } from '../WebDAVRequest'
import { XMLElement } from 'xml-js-builder'
import { IResource } from '../../../resource/v1/IResource'
import { FSPath } from '../../../manager/v1/FSPath'
import { Lock } from '../../../resource/v1/lock/Lock'

export type EventsName = 'create' | 'delete' | 'copy' | 'move'
    | 'lock' | 'refreshLock' | 'unlock'
    | 'setProperty' | 'removeProperty'
    | 'write' | 'read'
    | 'addChild';

export type DetailsType = IResource | FSPath | Lock | XMLElement;
export type Listener = (arg : MethodCallArgs, subjectResource : IResource, details ?: DetailsType) => void;

function getEventBag(_this : any, event ?: string)
{
    if(!_this.__events)
        _this.__events = { };

    if(event && !_this.__events[event])
    {
        _this.__events[event] = {
            all: [],
            named: {}
        };
        return _this.__events[event];
    }
    
    return event ? _this.__events[event] : _this.__events;
}

export function invoke(event : EventsName, arg : MethodCallArgs, subjectResource ?: IResource, details ?: DetailsType)
{
    const events = getEventBag(this, event);
    events.all.forEach((e) => process.nextTick(() => e(arg, subjectResource, details)));
}

export function register(event : EventsName, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.push(listener)
}

export function registerWithName(event : EventsName, name : string, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.push(listener);
    events.named[name] = listener;
}

export function clear(event : EventsName)
{
    const events = getEventBag(this, event);
    events.all = [];
    events.named = {};
}

export function clearAll(event : EventsName)
{
    this.__events = { };
}

export function remove(event : EventsName, listener : Listener)
{
    const events = getEventBag(this, event);
    events.all.indexOf(listener);
}

export function removeByName(event : EventsName, name : string)
{
    const events = getEventBag(this, event);
    const listener = events.named[name];
    if(listener)
    {
        delete events.named[name];
        events.all.splice(events.all.indexOf(listener), 1);
    }
}

