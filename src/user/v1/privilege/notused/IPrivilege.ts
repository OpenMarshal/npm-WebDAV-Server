
export interface IPrivilege
{
    description : string;
    isAbstract : boolean;
    name : string;

    can(operation : string) : boolean;
}
