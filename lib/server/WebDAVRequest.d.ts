import { MethodCallArgs } from './MethodCallArgs';
export { MethodCallArgs } from './MethodCallArgs';
export { HTTPCodes } from './HTTPCodes';
export interface WebDAVRequest {
    (arg: MethodCallArgs, callback: () => void): void;
    chunked?: (arg: MethodCallArgs, callback: () => void) => void;
}
