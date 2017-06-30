import { ITestableUserManager } from '../userManager/ITestableUserManager'
import { IListUserManager } from '../userManager/IListUserManager'
import { SimpleUser } from './SimpleUser'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'

export class SimpleUserManager implements ITestableUserManager, IListUserManager
{
    protected users : any

    constructor()
    {
        this.users = {
            __default: new SimpleUser('DefaultUser', null, false, true)
        };
    }

    getUserByName(name : string, callback : (error : Error, user ?: IUser) => void)
    {
        if(!this.users[name])
            callback(Errors.UserNotFound);
        else
            callback(null, this.users[name]);
    }
    getDefaultUser(callback : (user : IUser) => void)
    {
        callback(this.users.__default);
    }

    addUser(name : string, password : string, isAdmin : boolean = false) : IUser
    {
        const user = new SimpleUser(name, password, isAdmin, false);
        this.users[name] = user;
        return user;
    }

    getUsers(callback : (error : Error, users : IUser[]) => void)
    {
        const users = [];

        for(const name in this.users)
            users.push(this.users[name]);

        callback(null, users);
    }
    
    getUserByNamePassword(name : string, password : string, callback : (error : Error, user ?: IUser) => void) : void
    {
        this.getUserByName(name, (e, user) => {
            if(e)
                return callback(e);
            
            if(user.password === password)
                callback(null, user);
            else
                callback(Errors.UserNotFound);
        })
    }
}
