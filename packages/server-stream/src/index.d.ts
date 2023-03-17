import { LogStream } from '@browser-bunyan/levels';

type ServerStreamOpts = {
    method?: string,
    url?: string,
    headers?: Object,
    throttleInterval?: number,
    withCredentials?: boolean,
    onError?: Function,
    flushOnClose?: boolean,
    writeCondition?: Function,

}

export declare class ServerStream implements LogStream {
    currentThrottleTimeout: number | undefined;
    writeCondition: ((record?: object) => boolean) | undefined;
    records: object | undefined;
    headers: { [header: string]: string }

    constructor(opts?: ServerStreamOpts);

    write(record: object): void;

    start(opts?: ServerStreamOpts): void;

    stop(): void;

    recordsAsArray(): Array<object>;

    static defaultWriteCondition(): boolean;
}
