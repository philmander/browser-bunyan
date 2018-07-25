import { TRACE, FATAL, nameFromLevel } from '@browser-bunyan/levels';

export class ConsolePlainStream {

    constructor({ logByLevel = false } = {}) {
        this.logByLevel = logByLevel;
    }

    write(rec) {
        let consoleMethod;

        const loggerName = rec.childName ? rec.name + '/' + rec.childName : rec.name;

        //get level name and pad start with spaces
        let levelName = nameFromLevel[rec.level];
        const formattedLevelName = (Array(6 - levelName.length).join(' ') + levelName).toUpperCase();

        if (this.logByLevel) {
            if (rec.level === TRACE) {
                levelName = 'debug';
            } else if (rec.level === FATAL) {
                levelName = 'error';
            }
            consoleMethod = typeof console[levelName] === 'function' ? console[levelName] : console.log;
        } else {
            consoleMethod = console.log;
        }

        const padZeros = (number, len) => Array((len + 1) - (number + '').length).join('0') + number;

        let msg = '[' + padZeros(rec.time.getHours(), 2) + ':';
        msg += padZeros(rec.time.getMinutes(), 2) + ':';
        msg += padZeros(rec.time.getSeconds(), 2) + ':';
        msg += padZeros(rec.time.getMilliseconds(), 4) + '] ';
        msg += formattedLevelName + ': ';
        msg += loggerName + ': ' ;
        msg += rec.msg;
        if (rec.src) {
            msg += ' (' + rec.src + ')';
        }

        consoleMethod.call(console, msg);
        if (rec.err && rec.err.stack) {
            consoleMethod.call(console, rec.err.stack);
        }
        if (rec.obj) {
            consoleMethod.call(console, rec.obj);
        }
    }
}