export const TRACE = 10;
export const DEBUG = 20;
export const INFO = 30;
export const WARN = 40;
export const ERROR = 50;
export const FATAL = 60;

export const levelFromName = {
    'trace': TRACE,
    'debug': DEBUG,
    'info': INFO,
    'warn': WARN,
    'error': ERROR,
    'fatal': FATAL,
};
export const nameFromLevel = {};
Object.keys(levelFromName).forEach(name => {
    nameFromLevel[levelFromName[name]] = name;
});

/**
 * Resolve a level number, name (upper or lowercase) to a level number value.
 *
 * @api public
 */
export function resolveLevel(nameOrNum) {
    return (typeof (nameOrNum) === 'string' ? levelFromName[nameOrNum.toLowerCase()] : nameOrNum);
}