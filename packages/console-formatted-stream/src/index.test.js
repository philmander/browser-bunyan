import { INFO } from '@browser-bunyan/levels';
import { ConsoleFormattedStream } from './index';
import { test } from 'babel-tap';
import stdMocks from 'std-mocks';

const rec  = {
    name: 'tester',
    level: INFO,
    time: new Date(2016, 1, 29, 23, 46, 12, 1),
    msg: 'Look at me',
};

test('Writes records', t => {
    stdMocks.use();
    const stream = new ConsoleFormattedStream();
    stream.write(rec);
    stdMocks.restore();
    const out = stdMocks.flush().stdout;
    const wanted = '[23:46:12:0001] %ccolor: DarkTurquoise%c:  INFO: %ccolor: DimGray  tester color: SteelBlue Look at me\n';
    t.equal(out[0], wanted);
    t.end();
});

test('Writes errors', t => {
    const errRec = Object.assign({}, rec);
    errRec.err = new Error('Oh no!');
    stdMocks.use();
    const stream = new ConsoleFormattedStream();
    stream.write(errRec);
    stdMocks.restore();
    const out = stdMocks.flush().stdout;
    t.ok(out[1].indexOf('%ccolor: DarkTurquoise, Error: Oh no!') > -1);

    t.end();
});

test('Writes objects', t => {
    const objRec = Object.assign({}, rec);
    objRec.obj = { foo: 'bar' };
    stdMocks.use();
    const stream = new ConsoleFormattedStream();
    stream.write(objRec);
    stdMocks.restore();
    const out = stdMocks.flush().stdout;
    t.equal(out[1], '{ foo: \'bar\' }\n');

    t.end();
});