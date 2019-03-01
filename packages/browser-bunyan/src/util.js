export const CALL_STACK_ERROR = 'call-stack-error';

/**
 * A shallow copy of an object. Bunyan logging attempts to never cause
 * exceptions, so this function attempts to handle non-objects gracefully.
 */
export function objCopy(obj) {
    if (typeof  obj === 'undefined' || obj ===  null) {  // null or undefined
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.slice();
    } else if (typeof (obj) === 'object') {
        const copy = {};
        Object.keys(obj).forEach(function (k) {
            copy[k] = obj[k];
        });
        return copy;
    } else {
        return obj;
    }
}

//---- These are simplified versions of util.format without importing the whole module, which would be bulky when browserified

export function inspect(obj) {
    if(typeof obj === 'undefined') {
        return 'undefined';
    }
    if(obj === null) {
        return 'null';
    }
    if(Array.isArray(obj)) {
        const items = obj.map(obj => inspect(obj));
        return '[ ' + items.join(', ') + ' ]';
    }
    if(typeof obj === 'object') {
        return JSON.stringify(obj);
    }
    if(typeof obj === 'function') {
        return '[Function: ' + obj.name + ']';
    }
    if(typeof obj === 'boolean' || typeof obj === 'number') {
        return obj;
    }
    return '\'' + obj.toString() + '\'';
}

export function format(f) {
    if (typeof f !== 'string') {
        const objects = new Array(arguments.length);
        for (let i = 0; i < arguments.length; i++) {
            objects[i] = inspect(arguments[i]);
        }
        return objects.join(' ');
    }

    const formatRegExp = /%[sdj%]/g;

    let i = 1;
    const args = arguments;
    const len = args.length;
    let str = String(f).replace(formatRegExp, x => {
        if (x === '%%') {
            return '%';
        }
        if (i >= len) {
            return x;
        }
        switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j':
            try {
                return JSON.stringify(args[i++]);
            } catch (_) {
                return '[Circular]';
            }
        default:
            return x;
        }
    });
    for (let x = args[i]; i < len; x = args[++i]) {
        if (x === null || typeof (x) !== 'object') {
            str += ' ' + x;
        } else {
            str += ' ' + inspect(x);
        }
    }
    return str;
}

export function extractSrcFromStacktrace(stack, level) {
    const stackLines = stack.split('\n');

    //chrome starts with error
    if(stackLines[0] && stackLines[0].indexOf(CALL_STACK_ERROR) >= 0) {
        stackLines.shift();
    }

    //the line of the stacktrace
    const targetLine = stackLines[level];
    let lineInfo = null;
    if(targetLine) {
        const execResult = /^\s*(at|.*@)\s*(.+)?$/.exec(targetLine);
        if(Array.isArray(execResult) && execResult[2]) {
            lineInfo = execResult[2];
        } else {
            lineInfo = targetLine;
        }
    }
    return lineInfo;
}

export function _indent(s, indent) {
    if (!indent) {
        indent = '    ';
    }
    const lines = s.split(/\r?\n/g);
    return indent + lines.join('\n' + indent);
}

const _warned = {};

/**
 * Warn about an bunyan processing error.
 *
 * @param msg {String} Message with which to warn.
 * @param dedupKey {String} Optional. A short string key for this warning to
 *      have its warning only printed once.
 */
export function _warn(msg, dedupKey) {
    if (dedupKey) {
        if (_warned[dedupKey]) {
            return;
        }
        _warned[dedupKey] = true;
    }
    console.error(msg + '\n');
}
export function _haveWarned(dedupKey) {
    return _warned[dedupKey];
}

// A JSON stringifier that handles cycles safely.
// Usage: JSON.stringify(obj, safeCycles())
export function safeCycles() {
    const seen = [];
    return (key, val) => {
        if (!val || typeof (val) !== 'object') {
            return val;
        }
        if (seen.indexOf(val) !== -1) {
            return '[Circular]';
        }
        seen.push(val);
        return val;
    };
}