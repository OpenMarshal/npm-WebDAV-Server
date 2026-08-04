const sinon = require("sinon");
const expect = require("chai").expect;
const { v2 } = require("../../../../../lib/index");

describe("Path", () => {
    [
        [undefined, []],
        [null, []],
        [``, []],

        [`/`, []],
        [`//`, []],
        [`/test/path/1`, [`test`, `path`, `1`]],
        [`//test//path//1`, [`test`, `path`, `1`]],
        [`//test////path//1`, [`test`, `path`, `1`]],
        [`test/path/1`, [`test`, `path`, `1`]],
        [`test/path/1/`, [`test`, `path`, `1`]],
        [`/test/path/1/`, [`test`, `path`, `1`]],

        [`/test／path/1/`, [`test／path`, `1`]],

        [`\\`, []],
        [`\\\\`, []],
        [`\\test\\path\\1`, [`test`, `path`, `1`]],
        [`\\\\test\\\\path\\\\1`, [`test`, `path`, `1`]],
        [`\\\\test\\\\\\\\path\\\\1`, [`test`, `path`, `1`]],
        [`test\\path\\1`, [`test`, `path`, `1`]],
        [`test\\path\\1\\`, [`test`, `path`, `1`]],
        [`\\test\\path\\1\\`, [`test`, `path`, `1`]],
    ].forEach(([input, expected]) => it(`success Path(string '${input}').paths`, () => {
        const path = new v2.Path(input);
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));
    [
        [[], []],
        [[`test`, `path`, `1`], [`test`, `path`, `1`]],
        [[`test／path`, `1`], [`test／path`, `1`]],
        [[`test/path`, `1`], [`test`, `path`, `1`]],
        [[`test\\path`, `1`], [`test`, `path`, `1`]],
    ].forEach(([input, expected]) => it(`success Path(${JSON.stringify(input)}).paths`, () => {
        const path = new v2.Path(input);
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));
    [
        [new v2.Path(``), []],

        [new v2.Path(`/`), []],
        [new v2.Path(`//`), []],
        [new v2.Path(`/test/path/1`), [`test`, `path`, `1`]],
        [new v2.Path(`//test//path//1`), [`test`, `path`, `1`]],
        [new v2.Path(`//test////path//1`), [`test`, `path`, `1`]],
        [new v2.Path(`test/path/1`), [`test`, `path`, `1`]],
        [new v2.Path(`test/path/1/`), [`test`, `path`, `1`]],
        [new v2.Path(`/test/path/1/`), [`test`, `path`, `1`]],

        [new v2.Path(`/test／path/1/`), [`test／path`, `1`]],

        [new v2.Path(`\\`), []],
        [new v2.Path(`\\\\`), []],
        [new v2.Path(`\\test\\path\\1`), [`test`, `path`, `1`]],
        [new v2.Path(`\\\\test\\\\path\\\\1`), [`test`, `path`, `1`]],
        [new v2.Path(`\\\\test\\\\\\\\path\\\\1`), [`test`, `path`, `1`]],
        [new v2.Path(`test\\path\\1`), [`test`, `path`, `1`]],
        [new v2.Path(`test\\path\\1\\`), [`test`, `path`, `1`]],
        [new v2.Path(`\\test\\path\\1\\`), [`test`, `path`, `1`]],
    ].forEach(([input, expected]) => it(`success Path(Path '${input}').paths`, () => {
        const path = new v2.Path(input);
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));

    const resolveDataSet = [
        [``, []],

        [`/`, []],
        [`//`, []],
        [`/test/path/1`, [`test`, `path`, `1`]],
        [`//test//path//1`, [`test`, `path`, `1`]],
        [`//test////path//1`, [`test`, `path`, `1`]],
        [`test/path/1`, [`test`, `path`, `1`]],
        [`test/path/1/`, [`test`, `path`, `1`]],
        [`/test/path/1/`, [`test`, `path`, `1`]],

        [`/test／path/1/`, [`test／path`, `1`]],

        [`/test/../path/1`, [`path`, `1`]],
        [`/test/../path/../1`, [`1`]],
        [`/test/../path/../1/..`, []],

        [`.`, []],
        [`/.`, []],
        [`/./`, []],
        [`./`, []],
        [`/./test/./path/./1/.`, [`test`, `path`, `1`]],
        [`/./test/./path/./1/./`, [`test`, `path`, `1`]],
        [`././test/./path/./1/.`, [`test`, `path`, `1`]],


        [`\\`, []],
        [`\\\\`, []],
        [`\\test\\path\\1`, [`test`, `path`, `1`]],
        [`\\\\test\\\\path\\\\1`, [`test`, `path`, `1`]],
        [`\\\\test\\\\\\\\path\\\\1`, [`test`, `path`, `1`]],
        [`test\\path\\1`, [`test`, `path`, `1`]],
        [`test\\path\\1\\`, [`test`, `path`, `1`]],
        [`\\test\\path\\1\\`, [`test`, `path`, `1`]],

        [`\\test\\..\\path\\1`, [`path`, `1`]],
        [`\\test\\..\\path\\..\\1`, [`1`]],
        [`\\test\\..\\path\\..\\1\\..`, []],

        [`\\.`, []],
        [`\\.\\`, []],
        [`.\\`, []],
        [`\\.\\test\\.\\path\\.\\1\\.`, [`test`, `path`, `1`]],
        [`\\.\\test\\.\\path\\.\\1\\.\\`, [`test`, `path`, `1`]],
        [`.\\.\\test\\.\\path\\.\\1\\.`, [`test`, `path`, `1`]],
    ];
    resolveDataSet.forEach(([input, expected]) => it(`success Path(${input}).resolve()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));
    resolveDataSet.forEach(([input, expected]) => it(`success Path(${input}).resolve() twice`, () => {
        const path = new v2.Path(input);
        path.resolve();
        path.resolve();
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));

    [
        [`/test/path/1`, [`test`, `path`, `1`]],
        [`/test/%2e%2e/path/1`, [`test`, `..`, `path`, `1`]],
        [`test%20%5C%25path`, [`test `, `%path`]],
        [`%2Ftest%20%5C%25path`, [`test `, `%path`]],
        [`test%EF%BC%8Fpath`, [`test／path`]],
    ].forEach(([input, expected]) => it(`success Path(${input}).decode()`, () => {
        const path = new v2.Path(input);
        path.decode();
        expect(path.paths).to.be.an('array').that.deep.equal(expected);
    }));

    [
        [``, true],
        [`/`, true],

        [`/x`, false],
        [`x`, false],
        [`x/`, false],
        [`/x/`, false],
    ].forEach(([input, expected]) => it(`success Path(${input}).isRoot()`, () => {
        const path = new v2.Path(input);
        expect(path.isRoot()).to.be.equal(expected);
    }));
    [
        [``, true],
        [`/`, true],
        [`.`, true],
        [`/.`, true],
        [`./`, true],
        [`/./`, true],
        [`/././././././`, true],
        [`/x/..`, true],
        [`/x/../`, true],

        [`/x`, false],
        [`x`, false],
        [`x/`, false],
        [`/x/`, false],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().isRoot()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.isRoot()).to.be.equal(expected);
    }));

    [
        [``, undefined],
        [`/`, undefined],
        [`.`, undefined],
        [`/.`, undefined],
        [`./`, undefined],
        [`/./`, undefined],
        [`/././././././`, undefined],
        [`/x/..`, undefined],
        [`/x/../`, undefined],

        [`/x`, `x`],
        [`x`, `x`],
        [`x/`, `x`],
        [`/x/`, `x`],

        [`/y/x`, `x`],
        [`y/x`, `x`],
        [`/y/x/`, `x`],
        [`/y/x/`, `x`],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().fileName()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.fileName()).to.be.equal(expected);
    }));

    [
        [``, undefined],
        [`/`, undefined],
        [`.`, undefined],
        [`/.`, undefined],
        [`./`, undefined],
        [`/./`, undefined],
        [`/././././././`, undefined],
        [`/x/..`, undefined],
        [`/x/../`, undefined],

        [`/x`, `x`],
        [`x`, `x`],
        [`x/`, `x`],
        [`/x/`, `x`],

        [`/y/x`, `y`],
        [`y/x`, `y`],
        [`/y/x/`, `y`],
        [`/y/x/`, `y`],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().rootName()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.rootName()).to.be.equal(expected);
    }));

    [
        [``, undefined],
        [`/`, undefined],
        [`.`, undefined],
        [`/.`, undefined],
        [`./`, undefined],
        [`/./`, undefined],
        [`/././././././`, undefined],
        [`/x/..`, undefined],
        [`/x/../`, undefined],

        [`/x`, undefined],
        [`x`, undefined],
        [`x/`, undefined],
        [`/x/`, undefined],

        [`/y/x`, `y`],
        [`y/x`, `y`],
        [`/y/x/`, `y`],
        [`/y/x/`, `y`],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().parentName()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.parentName()).to.be.equal(expected);
    }));

    [
        [``, false],
        [`/`, false],
        [`.`, false],
        [`/.`, false],
        [`./`, false],
        [`/./`, false],
        [`/././././././`, false],
        [`/x/..`, false],
        [`/x/../`, false],
        [`/x`, false],

        [`/y/x`, true],
        [`/y/x/z/a/b/c`, true],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().hasParent()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.hasParent()).to.be.equal(expected);
    }));

    [
        [``, new v2.Path('')],
        [`/`, new v2.Path('')],
        [`.`, new v2.Path('')],
        [`/x`, new v2.Path('')],

        [`/y/x`, new v2.Path('/y')],
        [`/y/x/z`, new v2.Path('/y/x')],
    ].forEach(([input, expected]) => it(`success Path(${input}).resolve().getParent()`, () => {
        const path = new v2.Path(input);
        path.resolve();
        expect(path.getParent()).to.be.deep.equal(expected);
    }));

    [
        [``, undefined, []],
        [`/y`, `y`, []],
        [`/y/x`, `y`, ['x']],
        [`/y/x/z`, `y`, ['x', 'z']],
    ].forEach(([input, expectedResult, expectedPaths]) => it(`success Path(${input}).removeRoot()`, () => {
        const path = new v2.Path(input);
        const result = path.removeRoot();
        expect(result).to.be.deep.equal(expectedResult);
        expect(path.paths).to.be.deep.equal(expectedPaths);
    }));

    [
        [``, undefined, []],
        [`/y`, `y`, []],
        [`/y/x`, `x`, ['y']],
        [`/y/x/z`, `z`, ['y', 'x']],
    ].forEach(([input, expectedResult, expectedPaths]) => it(`success Path(${input}).removeFile()`, () => {
        const path = new v2.Path(input);
        const result = path.removeFile();
        expect(result).to.be.deep.equal(expectedResult);
        expect(path.paths).to.be.deep.equal(expectedPaths);
    }));

    it(`Path.getChildPath doesn't alter the original path`, () => {
        const path = new v2.Path(`/a/b`);
        const childPath = new v2.Path(`/x/y`);

        const result = path.getChildPath(childPath);

        expect(childPath.paths).to.be.deep.equal(['x', 'y']);
        expect(result.paths).to.be.deep.equal(['a', 'b', 'x', 'y']);
        expect(path.paths).to.be.deep.equal(['a', 'b']);
    });

    it(`Path.clone()`, () => {
        const path = new v2.Path(`/a/b`);

        const result = path.clone();
        result.removeFile();

        expect(result.paths).to.be.deep.equal(['a']);
        expect(path.paths).to.be.deep.equal(['a', 'b']);
    });

    [
        [[], `/`],
        [[`test`, `path`, `1`], `/test/path/1`],
        [[`test／path`, `1`], `/test／path/1`],
        [[`test/path`, `1`], `/test/path/1`],
        [[`test\\path`, `1`], `/test/path/1`],
    ].forEach(([input, expected]) => it(`success Path(${JSON.stringify(input)}).toString()`, () => {
        const path = new v2.Path(input);
        expect(path.toString()).to.be.equal(expected);
    }));
    [
        [[], `/`],
        [[`test`, `path`, `1`], `/test/path/1`],
        [[`test／path`, `1`], `/test／path/1`],
        [[`test/path`, `1`], `/test/path/1`],
        [[`test\\path`, `1`], `/test/path/1`],
    ].forEach(([input, expected]) => it(`success Path(${JSON.stringify(input)}).toString(false)`, () => {
        const path = new v2.Path(input);
        expect(path.toString(false)).to.be.equal(expected);
    }));
    [
        [[], `/`],
        [[`test`, `path`, `1`], `/test/path/1/`],
        [[`test／path`, `1`], `/test／path/1/`],
        [[`test/path`, `1`], `/test/path/1/`],
        [[`test\\path`, `1`], `/test/path/1/`],
    ].forEach(([input, expected]) => it(`success Path(${JSON.stringify(input)}).toString(true)`, () => {
        const path = new v2.Path(input);
        expect(path.toString(true)).to.be.equal(expected);
    }));

    [
        new Buffer('/invalid/object'),
        -1,
        0,
        1,
        true,
        false,
        {},
        () => {},
        v2.Path,
    ].forEach((input) => it(`fail Path(${JSON.stringify(input)})`, () => {
        expect(() => {
            new v2.Path(input);
        }).to.throw();
    }));
})
