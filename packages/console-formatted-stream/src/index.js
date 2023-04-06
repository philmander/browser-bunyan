import { TRACE, DEBUG, INFO, WARN, ERROR, FATAL } from '@browser-bunyan/levels';
const DEFAULT_CSS = {
    levels: {
        trace: 'color: DeepPink',
        debug: 'color: GoldenRod',
        info: 'color: DarkTurquoise',
        warn: 'color: Purple',
        error: 'color: Crimson',
        fatal: 'color: Black',
    },
    def: 'color: DimGray',
    msg: 'color: SteelBlue',
    src: 'color: DimGray; font-style: italic; font-size: 0.9em',
};

export class ConsoleFormattedStream {

    constructor({ logByLevel = false, css = DEFAULT_CSS } = {}) {
        this.logByLevel = logByLevel;
        this.css = css;
    }

    write(rec) {
        let levelCss, consoleMethod;
        const defaultCss = this.css.def;
        const msgCss = this.css.msg;
        const srcCss = this.css.src;

        const loggerName = rec.childName ? rec.name + '/' + rec.childName : rec.name;

        //get level name and pad start with spacs
        let levelName = rec.levelName || 'info';
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
            levelCss = this.css.levels.trace;
        } else if (rec.level < INFO) {
            levelCss = this.css.levels.debug;
        } else if (rec.level < WARN) {
            levelCss = this.css.levels.info;
        } else if (rec.level < ERROR) {
            levelCss = this.css.levels.warn;
        } else if (rec.level < FATAL) {
            levelCss = this.css.levels.error;
        } else {
            levelCss = this.css.levels.fatal;
        }

        const padZeros = (number, len) => Array((len + 1) - (number + '').length).join('0') + number;

        const logArgs = [];
        // [time] level: loggerName: msg src?
        logArgs.push(`[%s:%s:%s:%s] %c%s%c: %s: %c%s ${rec.src ? '%c%s' : ''}`);
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
        if (rec.obj) {
            logArgs.push('\n');
            logArgs.push(rec.obj);
        }
        if (rec.err && rec.err.stack) {
            logArgs.push('\n');
            logArgs.push(rec.err.stack);
        }
        consoleMethod.apply(console, logArgs);
    }

    static getDefaultCss() {
        return DEFAULT_CSS;
    }
}
