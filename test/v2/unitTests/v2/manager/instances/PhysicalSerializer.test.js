const chai = require("chai");
const expect = chai.expect;
const { v2 } = require("../../../../../../lib/index");

chai.use(require('chai-as-promised').default);

describe("PhysicalSerializer", () => {
    it(`success PhysicalSerializer().setRights.getRights`, async () => {
        const server = new v2.WebDAVServer();
        const ctx = new v2.RequestContext(server, '/', {});

        const fileSystem = new v2.PhysicalFileSystem('/tmp/');
        const physicalSerializer = new v2.PhysicalSerializer();

        server.setFileSystemSync('/', fileSystem);

        const propertyManager = await fileSystem.propertyManagerAsync(ctx, '/file');
        propertyManager.setProperty('key', 'value', {
            a: 1,
            b: '2'
        }, () => {
            physicalSerializer.serialize(fileSystem, (e, data) => {
                expect(e).to.be.null;
                expect(data).to.not.be.null;
                expect(data).to.not.be.undefined;

                const parsedData = JSON.parse(JSON.stringify(data));

                physicalSerializer.unserialize(parsedData, async (e, fs) => {
                    expect(e).to.be.null;
                    expect(fs).to.not.be.null;
                    expect(fs).to.not.be.undefined;

                    const propertyManager = await fs.propertyManagerAsync(ctx, '/file');
                    propertyManager.getProperty('key', (e, propertyValue, propertyAttributes) => {
                        expect(e).to.be.null;
                        expect(propertyValue).to.be.equal('value');
                        expect(propertyAttributes).to.be.deep.equal({
                            a: 1,
                            b: '2'
                        });
                    });
                });
            });
        });
    });
})
