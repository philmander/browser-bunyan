import { LogStream } from '@browser-bunyan/levels';

type ConsoleFormattedStreamOpts = {
    logByLevel?: boolean,
    css?: object,
}

export declare class ConsoleFormattedStream implements LogStream {
    constructor(opts?: ConsoleFormattedStreamOpts);

    write(record: object): void;

    static getDefaultCss(): object;
}
