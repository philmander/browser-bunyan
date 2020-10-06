import { LogStream } from '@browser-bunyan/levels';

type ConsolePlainStreamOpts = {
    logByLevel?: boolean,
}

export declare class ConsolePlainStream implements LogStream {
    constructor(opts?: ConsolePlainStreamOpts);

    write(record: object): void;
}
