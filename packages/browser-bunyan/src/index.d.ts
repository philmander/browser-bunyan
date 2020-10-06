import { LogStream } from '@browser-bunyan/levels';

type LoggerOptions = {
    name: string,
    streams?: Array<StreamOptions>,
    serializers?: Object,
    src?: boolean,
    stream?: LogStream,
    level?: string | number,
}

type StreamOptions = {
    level?: string | number,
    stream: LogStream,
}

interface Logger {
    addStream(): void,
    addSerializers(): void,
    child(options?: LoggerOptions, simple?: boolean): Logger,

    level(): number,
    level(level: string | number): void,

    levels(): Array<number>,
    levels(stream: string): number,
    levels(stream: string | number, level: string | number): void,

    // trace
    trace(): boolean,
    trace(msg: string, ...args: any[]): void,
    trace(err: Error, msg: string, ...args: any[]): void,
    trace(fields: object, msg: string, ...args: any[]): void,
    // debug
    debug(): boolean,
    debug(msg: string, ...args: any[]): void,
    debug(err: Error, msg: string, ...args: any[]): void,
    debug(fields: object, msg: string, ...args: any[]): void,
    // info
    info(): boolean,
    info(msg: string, ...args: any[]): void,
    info(err: Error, msg: string, ...args: any[]): void,
    info(fields: object, msg: string, ...args: any[]): void,
    // warn
    warn(): boolean,
    warn(msg: string, ...args: any[]): void,
    warn(err: Error, msg: string, ...args: any[]): void,
    warn(fields: object, msg: string, ...args: any[]): void,
    // error
    error(): boolean,
    error(msg: string, ...args: any[]): void,
    error(err: Error, msg: string, ...args: any[]): void,
    error(fields: object, msg: string, ...args: any[]): void,
    // fatal
    fatal(): boolean,
    fatal(msg: string, ...args: any[]): void,
    fatal(err: Error, msg: string, ...args: any[]): void,
    fatal(fields: object, msg: string, ...args: any[]): void,
}

export type StdSerializers = {
    err: Function,
}

export * from '@browser-bunyan/levels';
export function createLogger(opts: LoggerOptions): Logger;
export const stdSerializers: StdSerializers;