import { TRACE, DEBUG, INFO, WARN, ERROR, FATAL, nameFromLevel, resolveLevel} from '@browser-bunyan/levels';
import { format, _haveWarned, _warn, extractSrcFromStacktrace, _indent, objCopy, safeCycles, CALL_STACK_ERROR } from './util';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';

const LOG_VERSION = 1;

//---- Logger class

/**
 * Create a Logger instance.
 *
 * @param options {Object} See documentation for full details. At minimum
 *    this must include a 'name' string key. Configuration keys:
 *      - `streams`: specify the logger output streams. This is an array of
 *        objects with these fields:
 *          - `type`: The stream type. See README.md for full details.
 *            Often this is implied by the other fields. Examples are
 *            'file', 'stream' and "raw".
 *          - `level`: Defaults to 'info'.
 *          - `path` or `stream`: The specify the file path or writeable
 *            stream to which log records are written. E.g.
 *            `stream: process.stdout`.
 *        See README.md for full details.
 *      - `level`: set the level for a single output stream (cannot be used
 *        with `streams`)
 *      - `stream`: the output stream for a logger with just one, e.g.
 *        `process.stdout` (cannot be used with `streams`)
 *      - `serializers`: object mapping log record field names to
 *        serializing functions. See README.md for details.
 *      - `src`: Boolean (default false). Set true to enable 'src' automatic
 *        field with log call source info.
 *    All other keys are log record fields.
 *
 * An alternative *internal* call signature is used for creating a child:
 *    new Logger(<parent logger>, <child options>[, <child opts are simple>]);
 *
 * @param _childSimple (Boolean) An assertion that the given `_childOptions`
 *    (a) only add fields (no config) and (b) no serialization handling is
 *    required for them. IOW, this is a fast path for frequent child
 *    creation.
 */
class Logger {
    constructor(options, _childOptions, _childSimple) {
        if (!(this instanceof Logger)) {
            return new Logger(options, _childOptions);
        }

        // Input arg validation.
        let parent;
        if (_childOptions !== undefined) {
            parent = options;
            options = _childOptions;
            if (!(parent instanceof Logger)) {
                throw new TypeError('invalid Logger creation: do not pass a second arg');
            }
        }
        if (!options) {
            throw new TypeError('options (object) is required');
        }
        if (!parent) {
            if (!options.name) {
                throw new TypeError('options.name (string) is required');
            }
        } else {
            if (options.name) {
                throw new TypeError('invalid options.name: child cannot set logger name');
            }
        }
        if (options.stream && options.streams) {
            throw new TypeError('cannot mix "streams" and "stream" options');
        }
        if (options.streams && !Array.isArray(options.streams)) {
            throw new TypeError('invalid options.streams: must be an array');
        }
        if (options.serializers && (typeof (options.serializers) !== 'object' || Array.isArray(options.serializers))) {
            throw new TypeError('invalid options.serializers: must be an object');
        }

        let fields, name, i;

        // Fast path for simple child creation.
        if (parent && _childSimple) {
            this._level = parent._level;
            this.streams = parent.streams;
            this.serializers = parent.serializers;
            this.src = parent.src;
            fields = this.fields = {};
            const parentFieldNames = Object.keys(parent.fields);
            for (i = 0; i < parentFieldNames.length; i++) {
                name = parentFieldNames[i];
                fields[name] = parent.fields[name];
            }
            const names = Object.keys(options);
            for (i = 0; i < names.length; i++) {
                name = names[i];
                fields[name] = options[name];
            }
            return;
        }

        // Null values.
        if (parent) {
            this._level = parent._level;
            this.streams = [];
            for (i = 0; i < parent.streams.length; i++) {
                const s = objCopy(parent.streams[i]);
                this.streams.push(s);
            }
            this.serializers = objCopy(parent.serializers);
            this.src = parent.src;
            this.fields = objCopy(parent.fields);
            if (options.level) {
                this.level(options.level);
            }
        } else {
            this._level = Number.POSITIVE_INFINITY;
            this.streams = [];
            this.serializers = null;
            this.src = false;
            this.fields = {};
        }

        // Handle *config* options (i.e. options that are not just plain data
        // for log records).
        if (options.stream) {
            this.addStream({
                type: 'stream',
                stream: options.stream,
                level: options.level,
            });
        } else if (options.streams) {
            options.streams.forEach(s => {
                this.addStream(s, options.level);
            });
        } else if (parent && options.level) {
            this.level(options.level);
        } else if (!parent) {
            /*
             * In the browser we'll be emitting to console.log by default.
             * Any console.log worth its salt these days can nicely render
             * and introspect objects (e.g. the Firefox and Chrome console)
             * so let's emit the raw log record. Are there browsers for which
             * that breaks things?
             */
            this.addStream({
                type: 'raw',
                stream: new ConsoleRawStream(),
                level: options.level,
            });
        }
        if (options.serializers) {
            this.addSerializers(options.serializers);
        }
        if (options.src) {
            this.src = true;
        }

        // Fields.
        // These are the default fields for log records (minus the attributes
        // removed in this constructor). To allow storing raw log records
        // (unrendered), `this.fields` must never be mutated. Create a copy for
        // any changes.
        fields = objCopy(options);
        delete fields.stream;
        delete fields.level;
        delete fields.streams;
        delete fields.serializers;
        delete fields.src;
        if (this.serializers) {
            this._applySerializers(fields);
        }
        Object.keys(fields).forEach(k => {
            this.fields[k] = fields[k];
        });
    }

    /**
     * Add a stream
     *
     * @param stream {Object}. Object with these fields:
     *    - `type`: The stream type. See README.md for full details.
     *      Often this is implied by the other fields. Examples are
     *      'file', 'stream' and "raw".
     *    - `path` or `stream`: The specify the file path or writeable
     *      stream to which log records are written. E.g.
     *      `stream: process.stdout`.
     *    - `level`: Optional. Falls back to `defaultLevel`.
     *    See README.md for full details.
     * @param defaultLevel {Number|String} Optional. A level to use if
     *      `stream.level` is not set. If neither is given, this defaults to INFO.
     */
    addStream(s, defaultLevel = INFO) {
        s = objCopy(s);

        //in browser bunyan, streams are always raw
        s.type = 'raw';
        s.level = resolveLevel(s.level || defaultLevel);

        if (s.level < this._level) {
            this._level = s.level;
        }

        this.streams.push(s);
        delete this.haveNonRawStreams;  // reset
    }

    /**
     * Add serializers
     *
     * @param serializers {Object} Optional. Object mapping log record field names
     *    to serializing functions. See README.md for details.
     */
    addSerializers(serializers) {
        if (!this.serializers) {
            this.serializers = {};
        }
        Object.keys(serializers).forEach(field => {
            const serializer = serializers[field];
            if (typeof (serializer) !== 'function') {
                throw new TypeError(format('invalid serializer for "%s" field: must be a function', field));
            }
            this.serializers[field] = serializer;
        });
    }

    /**
     * Create a child logger, typically to add a few log record fields.
     *
     * This can be useful when passing a logger to a sub-component, e.g. a
     * 'wuzzle' component of your service:
     *
     *    const wuzzleLog = log.child({component: 'wuzzle'})
     *    const wuzzle = new Wuzzle({..., log: wuzzleLog})
     *
     * Then log records from the wuzzle code will have the same structure as
     * the app log, *plus the component='wuzzle' field*.
     *
     * @param options {Object} Optional. Set of options to apply to the child.
     *    All of the same options for a new Logger apply here. Notes:
     *      - The parent's streams are inherited and cannot be removed in this
     *        call. Any given `streams` are *added* to the set inherited from
     *        the parent.
     *      - The parent's serializers are inherited, though can effectively be
     *        overwritten by using duplicate keys.
     *      - Can use `level` to set the level of the streams inherited from
     *        the parent. The level for the parent is NOT affected.
     * @param simple {Boolean} Optional. Set to true to assert that `options`
     *    (a) only add fields (no config) and (b) no serialization handling is
     *    required for them. IOW, this is a fast path for frequent child
     *    creation. See 'tools/timechild.js' for numbers.
     */
    child(options, simple) {
        return new (this.constructor)(this, options || {}, simple);
    }

    /**
     * Get/set the level of all streams on this logger.
     *
     * Get Usage:
     *    // Returns the current log level (lowest level of all its streams).
     *    log.level() -> INFO
     *
     * Set Usage:
     *    log.level(INFO)       // set all streams to level INFO
     *    log.level('info')     // can use 'info' et al aliases
     */
    level(value) {
        if (value === undefined) {
            return this._level;
        }
        const newLevel = resolveLevel(value);
        const len = this.streams.length;
        for (let i = 0; i < len; i++) {
            this.streams[i].level = newLevel;
        }
        this._level = newLevel;
    }

    /**
     * Get/set the level of a particular stream on this logger.
     *
     * Get Usage:
     *    // Returns an array of the levels of each stream.
     *    log.levels() -> [TRACE, INFO]
     *
     *    // Returns a level of the identified stream.
     *    log.levels(0) -> TRACE      // level of stream at index 0
     *    log.levels('foo')           // level of stream with name 'foo'
     *
     * Set Usage:
     *    log.levels(0, INFO)         // set level of stream 0 to INFO
     *    log.levels(0, 'info')       // can use 'info' et al aliases
     *    log.levels('foo', WARN)     // set stream named 'foo' to WARN
     *
     * Stream names: When streams are defined, they can optionally be given
     * a name. For example,
     *       log = new Logger({
     *         streams: [
     *           {
     *             name: 'foo',
     *             path: '/const/log/my-service/foo.log'
     *             level: 'trace'
     *           },
     *         ...
     *
     * @param name {String|Number} The stream index or name.
     * @param value {Number|String} The level value (INFO) or alias ('info').
     *    If not given, this is a 'get' operation.
     * @throws {Error} If there is no stream with the given name.
     */
    levels(name, value) {
        if (name === undefined) {
            return this.streams.map(s => s.level);
        }
        let stream;
        if (typeof (name) === 'number') {
            stream = this.streams[name];
            if (stream === undefined) {
                throw new Error('invalid stream index: ' + name);
            }
        } else {
            const len = this.streams.length;
            for (let i = 0; i < len; i++) {
                const s = this.streams[i];
                if (s.name === name) {
                    stream = s;
                    break;
                }
            }
            if (!stream) {
                throw new Error(format('no stream with name "%s"', name));
            }
        }
        if (value === undefined) {
            return stream.level;
        } else {
            const newLevel = resolveLevel(value);
            stream.level = newLevel;
            if (newLevel < this._level) {
                this._level = newLevel;
            }
        }
    }

    /**
     * Apply registered serializers to the appropriate keys in the given fields.
     *
     * Pre-condition: This is only called if there is at least one serializer.
     *
     * @param fields (Object) The log record fields.
     * @param excludeFields (Object) Optional mapping of keys to `true` for
     *    keys to NOT apply a serializer.
     */
    _applySerializers(fields, excludeFields) {
        // Check each serializer against these (presuming number of serializers
        // is typically less than number of fields).
        Object.keys(this.serializers).forEach(name => {
            if (fields[name] === undefined || (excludeFields && excludeFields[name])) {
                return;
            }
            try {
                fields[name] = this.serializers[name](fields[name]);
            } catch (err) {
                _warn(format('bunyan: ERROR: Exception thrown from the "%s" ' +
                    'Bunyan serializer. This should never happen. This is a bug' +
                    'in that serializer function.\n%s',
                name, err.stack || err));
                fields[name] = format('(Error in Bunyan log "%s" serializer broke field. See stderr for details.)', name);
            }
        });
    }

    /**
     * Emit a log record.
     *
     * @param rec {log record}
     * @param noemit {Boolean} Optional. Set to true to skip emission
     *      and just return the JSON string.
     */
    _emit(rec, noemit) {
        let i;

        // Lazily determine if this Logger has non-'raw' streams. If there are
        // any, then we need to stringify the log record.
        if (this.haveNonRawStreams === undefined) {
            this.haveNonRawStreams = false;
            for (i = 0; i < this.streams.length; i++) {
                if (!this.streams[i].raw) {
                    this.haveNonRawStreams = true;
                    break;
                }
            }
        }

        // Stringify the object. Attempt to warn/recover on error.
        let str;
        if (noemit || this.haveNonRawStreams) {
            try {
                str = JSON.stringify(rec, safeCycles()) + '\n';
            } catch (e) {
                const dedupKey = e.stack.split(/\n/g, 2).join('\n');
                _warn('bunyan: ERROR: Exception in ' +
                    '`JSON.stringify(rec)`. You can install the ' +
                    '"safe-json-stringify" module to have Bunyan fallback ' +
                    'to safer stringification. Record:\n' +
                    _indent(format('%s\n%s', rec, e.stack)),
                dedupKey);
                str = format('(Exception in JSON.stringify(rec): %j. See stderr for details.)\n', e.message);
            }
        }

        if (noemit) {
            return str;
        }

        const level = rec.level;
        for (i = 0; i < this.streams.length; i++) {
            const s = this.streams[i];
            if (s.level <= level) {
                s.stream.write(rec);
            }
        }

        return str;
    }
}

/**
 * Build a log emitter function for level minLevel. I.e. this is the
 * creator of `log.info`, `log.error`, etc.
 */
function mkLogEmitter(minLevel) {
    return function () {
        const log = this;

        function mkRecord(args) {
            let excludeFields;
            if (args[0] instanceof Error) {
                // `log.<level>(err, ...)`
                fields = {
                    // Use this Logger's err serializer, if defined.
                    err: (log.serializers && log.serializers.err ? log.serializers.err(args[0]) : stdSerializers.err(args[0])),
                };
                excludeFields = {err: true};
                if (args.length === 1) {
                    msgArgs = [fields.err.message];
                } else {
                    msgArgs = Array.prototype.slice.call(args, 1);
                }
            } else if (typeof (args[0]) !== 'object' && args[0] !== null || Array.isArray(args[0])) {
                // `log.<level>(msg, ...)`
                fields = null;
                msgArgs = Array.prototype.slice.call(args);
            } else {
                // `log.<level>(fields, msg, ...)`
                fields = args[0];
                if (args.length === 1 && fields.err && fields.err instanceof Error) {
                    msgArgs = [fields.err.message];
                } else {
                    msgArgs = Array.prototype.slice.call(args, 1);
                }
            }

            // Build up the record object.
            const rec = objCopy(log.fields);
            rec.level = minLevel;
            const recFields = (fields ? objCopy(fields) : null);
            if (recFields) {
                if (log.serializers) {
                    log._applySerializers(recFields, excludeFields);
                }
                Object.keys(recFields).forEach(k => {
                    rec[k] = recFields[k];
                });
            }
            rec.levelName = nameFromLevel[minLevel];
            rec.msg = msgArgs.length ? format.apply(log, msgArgs) : '';
            if (!rec.time) {
                rec.time = (new Date());
            }
            // Get call source info
            if (log.src && !rec.src) {
                try {
                    //need to throw the error so there is a stack in IE
                    throw new Error(CALL_STACK_ERROR);
                } catch (err) {
                    // in Safari there is missing stack trace sometimes
                    const src = err.stack ? extractSrcFromStacktrace(err.stack, 2) : '';
                    if (!src && !_haveWarned('src')) {
                        _warn('Unable to determine src line info', 'src');
                    }
                    rec.src = src || '';
                }
            }
            rec.v = LOG_VERSION;
            return rec;
        }

        let fields = null;
        let msgArgs = arguments;
        let rec = null;
        if (arguments.length === 0) {   // `log.<level>()`
            return (this._level <= minLevel);
        } else if (this._level > minLevel) {
            /* pass through */
        } else {
            rec = mkRecord(msgArgs);
            this._emit(rec);
        }
    };
}

/**
 * The functions below log a record at a specific level.
 *
 * Usages:
 *    log.<level>()  -> boolean is-trace-enabled
 *    log.<level>(<Error> err, [<string> msg, ...])
 *    log.<level>(<string> msg, ...)
 *    log.<level>(<object> fields, <string> msg, ...)
 *
 * where <level> is the lowercase version of the log level. E.g.:
 *
 *    log.info()
 *
 * @params fields {Object} Optional set of additional fields to log.
 * @params msg {String} Log message. This can be followed by additional
 *    arguments that are handled like
 *    [util.format](http://nodejs.org/docs/latest/api/all.html#util.format).
 */
Logger.prototype.trace = mkLogEmitter(TRACE);
Logger.prototype.debug = mkLogEmitter(DEBUG);
Logger.prototype.info = mkLogEmitter(INFO);
Logger.prototype.warn = mkLogEmitter(WARN);
Logger.prototype.error = mkLogEmitter(ERROR);
Logger.prototype.fatal = mkLogEmitter(FATAL);

/*
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror) and
 * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
 *
 * Based on `dumpException` in
 * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
 */
function getFullErrorStack(ex) {
    let ret = ex.stack || ex.toString();
    if (ex.cause && typeof (ex.cause) === 'function') {
        const cex = ex.cause();
        if (cex) {
            ret += '\nCaused by: ' + getFullErrorStack(cex);
        }
    }
    return (ret);
}

//---- Standard serializers
// A serializer is a function that serializes a JavaScript object to a
// JSON representation for logging. There is a standard set of presumed
// interesting objects in node.js-land.
export const stdSerializers = {
    // Serialize an Error object
    // (Core error properties are enumerable in node 0.4, not in 0.6).
    err: function(err) {
        if (!err || !err.stack) {
            return err;
        }

        return {
            message: err.message,
            name: err.name,
            stack: getFullErrorStack(err),
            code: err.code,
            signal: err.signal,
        };
    },
};

export { Logger };

export function createLogger(...args) {
    return new Logger(...args);
}
