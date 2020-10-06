import { createLogger, INFO, DEBUG, WARN, stdSerializers, resolveLevel } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { ConsolePlainStream } from '@browser-bunyan/console-plain-stream';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';

const log = createLogger({
    name: 'myLogger',
    streams: [
        {
            level: INFO, // or use the string 'info'
            stream: new ConsoleFormattedStream({ logByLevel: true }),
        },
        {
            level: DEBUG, // or use the string 'info'
            stream: new ConsolePlainStream({ logByLevel: true }),
        },
        {
            level: WARN, // or use the string 'info'
            stream: new ConsoleRawStream(),
        }
    ],
    serializers: {
        err: stdSerializers.err,
    },
    src: true,
});

const anotherLog = createLogger({
    name: 'another',
    stream: new ConsolePlainStream(),
})

log.warn(new Error('wut?'), 'the level of this log is %s', resolveLevel(log.level()));
log.warn({
    err: stdSerializers.err,
    foo: (v: object) => ({ foo: 'bar' })
}, 'the level of this log is %s', resolveLevel(log.level()));
log.warn('the level of this log is %s', resolveLevel(log.level()));
log.debug('debug is', resolveLevel(log.level()));