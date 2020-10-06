import { LogStream } from '@browser-bunyan/levels';

export declare class ConsoleRawStream implements LogStream {
    write(record: object): void;
}
