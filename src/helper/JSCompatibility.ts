
export let startsWith : (str : string, strToFind : string) => boolean;

const hasStartsWith = (String.prototype as any).startsWith;
if(hasStartsWith)
{
    startsWith = function(str : string & { startsWith(strToFind : string) : boolean }, strToFind : string) : boolean
    {
        return str.startsWith(strToFind);
    }
}
else
{
    startsWith = function(str : string, strToFind : string) : boolean
    {
        return str.lastIndexOf(strToFind, 0) === 0;
    }
}
