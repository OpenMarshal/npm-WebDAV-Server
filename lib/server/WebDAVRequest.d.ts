import { MethodCallArgs } from './MethodCallArgs';
import { ResourceType } from '../resource/IResource';
export { MethodCallArgs } from './MethodCallArgs';
export { HTTPCodes } from './HTTPCodes';
export interface WebDAVRequest {
    (arg: MethodCallArgs, callback: () => void): void;
    chunked?: (arg: MethodCallArgs, callback: () => void) => void;
    isValidFor?: (type?: ResourceType) => boolean;
}
