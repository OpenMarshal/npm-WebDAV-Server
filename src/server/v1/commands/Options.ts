import { HTTPCodes, MethodCallArgs } from '../WebDAVRequest'

export default function(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.setCode(HTTPCodes.OK);
        callback();
    })
}
