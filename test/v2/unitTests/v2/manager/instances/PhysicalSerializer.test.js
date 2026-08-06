const chai = require("chai");
const expect = chai.expect;
const { v2 } = require("../../../../../../lib/index");

chai.use(require('chai-as-promised').default);

describe("PhysicalSerializer", () => {
    it(`success PhysicalSerializer().serialize.unserialize`, (done) => {
        (async () => {
            try {
                const server = new v2.WebDAVServer();
                const ctx = new v2.RequestContext(server, '/', {});
                ctx.user = new v2.SimpleUser('user', '', false, false);

                const fileSystem = new v2.PhysicalFileSystem('/tmp/');
                const physicalSerializer = new v2.PhysicalSerializer();

                server.setFileSystemSync('/', fileSystem);

                const propertyManager = await fileSystem.propertyManagerAsync(ctx, '/file');
                propertyManager.setProperty('key', 'value', {
                    a: 1,
                    b: '2'
                }, () => {
                    try {
                        physicalSerializer.serialize(fileSystem, (e, data) => {
                            try {
                                expect(e).to.be.null;
                                expect(data).to.not.be.null;
                                expect(data).to.not.be.undefined;

                                const parsedData = JSON.parse(JSON.stringify(data));

                                physicalSerializer.unserialize(parsedData, async (e, fs) => {
                                    try {
                                        expect(e).to.be.null;
                                        expect(fs).to.not.be.null;
                                        expect(fs).to.not.be.undefined;

                                        server.setFileSystemSync('/', fs);

                                        const propertyManager = await fs.propertyManagerAsync(ctx, '/file');
                                        propertyManager.getProperty('key', async (e, propertyValue, propertyAttributes) => {
                                            try {
                                                expect(e).to.be.null;
                                                expect(propertyValue).to.be.equal('value');
                                                expect(propertyAttributes).to.be.deep.equal({
                                                    a: 1,
                                                    b: '2'
                                                });

                                                const isLocked = await fs.isLockedAsync(ctx, '/file');
                                                expect(isLocked).to.be.false;

                                                const lockManager = await fs.lockManagerAsync(ctx, '/file');
                                                const lock = new v2.Lock(new v2.LockKind(v2.LockScope.Exclusive, v2.LockType.Write), new v2.SimpleUser('', '', false, false), '');
                                                await lockManager.setLockAsync(lock);

                                                done();
                                            } catch(ex) {
                                                done(ex);
                                            }
                                        });
                                    } catch(ex) {
                                        done(ex);
                                    }
                                });
                            } catch(ex) {
                                done(ex);
                            }
                        });
                    } catch(ex) {
                        done(ex);
                    }
                });
            } catch(ex) {
                done(ex);
            }
        })();
    });
})
