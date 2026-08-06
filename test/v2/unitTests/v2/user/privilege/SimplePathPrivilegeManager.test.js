const chai = require("chai");
const expect = chai.expect;
const { v2 } = require("../../../../../../lib/index");
const { Resource } = require("../../../../../../lib/index.v2");

chai.use(require('chai-as-promised').default);

describe("SimplePathPrivilegeManager", () => {
    
    [
        (() => {
            const user = new v2.SimpleUser('user', 'password', false, false);
            user.uid = null;
            return user;
        })(),
        (() => {
            const user = new v2.SimpleUser('user', 'password', false, false);
            user.uid = undefined;
            return user;
        })(),
        (() => {
            const user = new v2.SimpleUser('admin', 'password', true, false);
            user.uid = null;
            return user;
        })(),
        (() => {
            const user = new v2.SimpleUser('admin', 'password', true, false);
            user.uid = undefined;
            return user;
        })(),
        0,
        1,
        -1,
        true,
        false,
        {},
        'invalidUser',
        () => {},
        undefined,
        null
    ].forEach((wrongUser) => it(`success SimplePathPrivilegeManager().setRights(wrong user = ${typeof wrongUser} ${JSON.stringify(wrongUser)}).canAsync()`, async () => {
        const contextUser = { user: wrongUser };

        const privilegeManager = new v2.SimplePathPrivilegeManager();
        expect(() => privilegeManager.setRights(wrongUser, '/', ['all'])).to.throw(v2.Errors.IllegalArguments);

        const resourceUser1 = new Resource('/', undefined, contextUser);

        const allRights = [
            'canRead', 'canReadLocks', 'canReadContent', 'canReadProperties', 'canReadContentTranslated', 'canReadContentSource',
            'canWrite', 'canWriteLocks', 'canWriteContent', 'canWriteProperties', 'canWriteContentTranslated', 'canWriteContentSource'
        ];

        for(const right of allRights) {
            expect(privilegeManager.canAsync('/', resourceUser1, right), `/ ${right}`).to.eventually.be.rejectedWith(v2.Errors.IllegalArguments);
            expect(privilegeManager.canAsync('/abc', resourceUser1, right), `/abc ${right}`).to.eventually.be.rejectedWith(v2.Errors.IllegalArguments);
        }
    }));

    it(`success SimplePathPrivilegeManager().setRights.getRights`, async () => {
        const user1 = new v2.SimpleUser('user1', 'password', false, false);
        user1.uid = 'user1';
        const user2 = new v2.SimpleUser('user2', 'password', false, false);
        user2.uid = 'user2';
        const user3 = new v2.SimpleUser('user3', 'password', false, false);
        user3.uid = 'user3';

        const privilegeManager = new v2.SimplePathPrivilegeManager();
        privilegeManager.setRights(user1, '/', ['all']);
        privilegeManager.setRights(user2, '/abc', ['canRead', 'canWrite']);

        const allRights = [
            'canRead', 'canReadLocks', 'canReadContent', 'canReadProperties', 'canReadContentTranslated', 'canReadContentSource',
            'canWrite', 'canWriteLocks', 'canWriteContent', 'canWriteProperties', 'canWriteContentTranslated', 'canWriteContentSource'
        ];

        expect(privilegeManager.getRights(user1, '/')).to.be.deep.equal([ 'all' ]);
        expect(privilegeManager.getRights(user1, '/abc')).to.be.deep.equal([ 'all' ]); // inherited
        expect(privilegeManager.getRights(user2, '/')).to.be.deep.equal([]);
        expect(privilegeManager.getRights(user2, '/abc').length).to.be.equal(allRights.length);
        expect(privilegeManager.getRights(user2, '/abc')).to.be.deep.members(allRights);
        expect(privilegeManager.getRights(user3, '/')).to.be.deep.equal([]);
        expect(privilegeManager.getRights(user3, '/abc')).to.be.deep.equal([]);
    });
    
    it(`success SimplePathPrivilegeManager().setRights.can`, async () => {
        const user1 = new v2.SimpleUser('user1', 'password', false, false);
        user1.uid = 'user1';
        const user2 = new v2.SimpleUser('user2', 'password', false, false);
        user2.uid = 'user2';
        const contextUser1 = { user: user1 };
        const contextUser2 = { user: user2 };

        const privilegeManager = new v2.SimplePathPrivilegeManager();
        privilegeManager.setRights(user1, '/', ['all']);
        privilegeManager.setRights(user2, '/abc', ['canRead', 'canWrite']);

        const resourceUser1 = new Resource('/', undefined, contextUser1);
        const resourceUser2 = new Resource('/', undefined, contextUser2);

        const allRights = [
            'canRead', 'canReadLocks', 'canReadContent', 'canReadProperties', 'canReadContentTranslated', 'canReadContentSource',
            'canWrite', 'canWriteLocks', 'canWriteContent', 'canWriteProperties', 'canWriteContentTranslated', 'canWriteContentSource'
        ];

        for(const right of allRights) {
            expect(await privilegeManager.canAsync('/', resourceUser1, right), `user1 / ${right}`).to.be.true;
            expect(await privilegeManager.canAsync('/', resourceUser2, right), `user2 / ${right}`).to.be.false;
            expect(await privilegeManager.canAsync('/abc', resourceUser1, right), `user1 /abc ${right}`).to.be.true;
            expect(await privilegeManager.canAsync('/abc', resourceUser2, right), `user2 /abc ${right}`).to.be.true;
        }
    });
})
