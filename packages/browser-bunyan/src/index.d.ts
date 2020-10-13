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

    level(level: string | number): void,
    level(): number,

    levels(stream: string | number, level: string | number): void,
    levels(stream: string): number,
    levels(): Array<number>,

    // trace
    trace(fields: object, msg: string, ...args: any[]): void,
    trace(err: Error, msg: string, ...args: any[]): void,
    trace(msg: string, ...args: any[]): void,
    trace(): boolean,

    // debug
    debug(fields: object, msg: string, ...args: any[]): void,
    debug(err: Error, msg: string, ...args: any[]): void,
    debug(msg: string, ...args: any[]): void,
    debug(): boolean,

    // info
    info(fields: object, msg: string, ...args: any[]): void,
    info(err: Error, msg: string, ...args: any[]): void,
    info(msg: string, ...args: any[]): void,
    info(): boolean,

    // warn
    warn(fields: object, msg: string, ...args: any[]): void,
    warn(err: Error, msg: string, ...args: any[]): void,
    warn(msg: string, ...args: any[]): void,
    warn(): boolean,

    // error
    error(fields: object, msg: string, ...args: any[]): void,
    error(err: Error, msg: string, ...args: any[]): void,
    error(msg: string, ...args: any[]): void,
    error(): boolean,

    // fatal
    fatal(fields: object, msg: string, ...args: any[]): void,
    fatal(err: Error, msg: string, ...args: any[]): void,
    fatal(msg: string, ...args: any[]): void,
    fatal(): boolean,
}

export type StdSerializers = {
    err: Function,
}

export * from '@browser-bunyan/levels';
export function createLogger(opts: LoggerOptions): Logger;
export const stdSerializers: StdSerializers;
export function safeCycles(): any;

export * from '@browser-bunyan/console-plain-stream';
export * from '@browser-bunyan/console-raw-stream';
export * from '@browser-bunyan/console-formatted-stream';