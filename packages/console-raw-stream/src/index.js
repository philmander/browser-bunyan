import { INFO, WARN, ERROR } from '@browser-bunyan/levels';

export class ConsoleRawStream {
    write(rec) {
        if (rec.level < INFO) {
            console.log(rec);
        } else if (rec.level < WARN) {
            console.info(rec);
        } else if (rec.level < ERROR) {
            console.warn(rec);
        } else {
            console.error(rec);
        }

        if(rec.err && rec.err.stack) {
            console.error(rec.err.stack);
        }
        if(rec.obj) {
            console.log(rec.obj);
        }
    }
}