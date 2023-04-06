export const TRACE: number;
export const DEBUG: number;
export const INFO: number;
export const WARN: number;
export const ERROR: number;
export const FATAL: number;

// doesn't really belong here, unless we redefine the "levels" package as
// "common" because I need a common place to put this interface
export interface LogStream {
    write(record: object): void;
}

export function resolveLevel(nameOrNum: string | number): number

export type LevelName = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export const levelFromName: Record<LevelName, number>;
export const nameFromLevel: Record<number, LevelName>;
