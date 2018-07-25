/**
 * !This is a stripped down version of Bunyan targeted specifically for the browser
 */

// levels
export {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
    resolveLevel,
    levelFromName,
    nameFromLevel,
} from '@browser-bunyan/levels';

export {
    stdSerializers,
    Logger,
    createLogger,
} from './logger';

export {
    // Useful for custom `type == 'raw'` streams that may do JSON stringification
    // of log records themselves. Usage:
    //    const str = JSON.stringify(rec, bunyan.safeCycles());
    safeCycles,
} from './util';

//streams
export { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
export { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';
export { ConsolePlainStream } from '@browser-bunyan/console-plain-stream';