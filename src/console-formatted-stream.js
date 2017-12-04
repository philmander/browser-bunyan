import { TRACE, DEBUG, INFO, WARN, ERROR, FATAL, nameFromLevel } from './levels';
export class ConsoleFormattedStream {

    constructor({ logByLevel = false} = {}) {
        this.logByLevel = !!logByLevel;
    }

    write(rec) {
        let levelCss,
            defaultCss = 'color: DimGray',
            msgCss = 'color: SteelBlue',
            srcCss = 'color: DimGray; font-style: italic; font-size: 0.9em',
            consoleMethod;

        const loggerName = rec.childName ? rec.name + '/' + rec.childName : rec.name;

        //get level name and pad start with spacs
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

        if (rec.level < DEBUG) {
            levelCss = 'color: DeepPink';
        } else if (rec.level < INFO) {
            levelCss = 'color: GoldenRod';
        } else if (rec.level < WARN) {
            levelCss = 'color: DarkTurquoise';
        } else if (rec.level < ERROR) {
            levelCss = 'color: Purple';
        } else if (rec.level < FATAL) {
            levelCss = 'color: Crimson';
        } else {
            levelCss = 'color: Black';
        }

        const padZeros = (number, len) => Array((len + 1) - (number + '').length).join('0') + number;

        const logArgs = [];
        logArgs.push('[%s:%s:%s:%s] %c%s%c: %s: %c%s %c%s');
        logArgs.push(padZeros(rec.time.getHours(), 2));
        logArgs.push(padZeros(rec.time.getMinutes(), 2));
        logArgs.push(padZeros(rec.time.getSeconds(), 2));
        logArgs.push(padZeros(rec.time.getMilliseconds(), 4));
        logArgs.push(levelCss);
        logArgs.push(formattedLevelName);
        logArgs.push(defaultCss);
        logArgs.push(loggerName);
        logArgs.push(msgCss);
        logArgs.push(rec.msg);
        if (rec.src) {
            logArgs.push(srcCss);
            logArgs.push(rec.src);
        }

        consoleMethod.apply(console, logArgs);
        if (rec.err && rec.err.stack) {
            consoleMethod.call(console, '%c%s,', levelCss, rec.err.stack);
        }
        if (rec.obj) {
            consoleMethod.call(console, rec.obj);
        }
    }
}