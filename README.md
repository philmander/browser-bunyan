browser-bunyan
===========

[![Build Status](https://travis-ci.org/philmander/browser-bunyan.svg?branch=master)](https://travis-ci.org/philmander/browser-bunyan)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


This package is an adaptation of, the Node logging library, [Bunyan](https://github.com/trentm/node-bunyan) but specifically for the browser.

Although Bunyan does support being [Browserified](https://github.com/trentm/node-bunyan#browserify), it is still a bit bloated with
features which aren't relevant in a browser environment.  You can expect a Browserified and Gzipped `node-bunyan` to
be around **27kb** whereas `browser-bunyan` is **3.5kb**, including its built-in log streams. With ES Modules and
tree-shaking this can be reduced further.

## Current status

Browser Bunyan was originally forked from an already mature library with a rich feature set and stable API. Furthermore, the browser environment is less complex than the server (no real streams etc). Consequently, I've found it doesn't need much work. Hopefully this is a testament to the quality of the codebase. So, don't be too concerned if you don't see that much activity in this repo. Please do raise issues for bugs, feature requests and ideas.

## Install

```
npm install browser-bunyan --save
```

## Usage

### Import

You can access Browser Bunyan's API using:

#### ES modules:

```javascript
import { createLogger } from 'browser-bunyan';
const logger = createLogger({ name: 'my-logger' });
logger.info('hi on info');
```

#### CommonJS

```javascript
const { createLogger } = require('browser-bunyan');
const logger = createLogger({ name: 'my-logger' });
logger.debug('hi on debug');
```

#### Browser global

To use as a **global**, include as a standard script tag:

```html
<script src="https://unpkg.com/browser-bunyan@1.4.0/lib/index.umd.js"></script>
```

now `bunyan` will be available as a global.

```javascript
const logger = bunyan.createLogger({ name: 'my-logger' });
logger.warn('hi on warning');
```

### Built-in Log Streams

Bunyan uses "log streams" to customize how each log record is processed. 
You can write your own to do whatever you want or use the built-in log streams 
which output log records to the console:

#### Console Formatted Stream

The core library also includes a dedicated browser console stream with nice formatting:

<img src="https://versatile.nl/images/browser-bunyan.png">

Use it like this:

```javascript
import { createLogger, INFO, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';

const log = createLogger({
    name: 'myLogger',
    streams: [
        {
            level: INFO, // or use the string 'info'
            stream: new ConsoleFormattedStream()
        }
    ],
    serializers: stdSerializers,
    src: true,
});

log.info('hi on info');
```
<a id=logByLevel></a>
##### logByLevel

By default this stream will use `console.log` for all logging. Pass the option `logByLevel` to the
`ConsoleFormattedStream` constructor to use the Console API's level specific logging methods ([`console.error`](https://developers.google.com/web/tools/chrome-devtools/console/console-reference#error), [`console.warn`](https://developers.google.com/web/tools/chrome-devtools/console/console-reference#warn), [`console.info`](https://developers.google.com/web/tools/chrome-devtools/console/console-reference#consoleinfoobject_object) and [`console.debug`](https://developers.google.com/web/tools/chrome-devtools/console/console-reference#consoledebugobject_object)). E.g.

```javascript
new ConsoleFormattedStream( { logByLevel: true } );
```

Please note that if you use this option your browser's console may also filter
out log output based on level, in addition to the Bunyan stream's log level.

##### Colors

The colors/css used by `ConsoleFormattedStream` are customizable:

```javascript
new ConsoleFormattedStream({
    css: {
        levels : {
            trace: 'color: DeepPink',
            debug: 'color: GoldenRod',
            info: 'color: DarkTurquoise',
            warm: 'color: Purple',
            error: 'color: Crimson',
            fatal: 'color: Black',
        },
        def: 'color: DimGray',
        msg : 'color: SteelBlue',
        src : 'color: DimGray; font-style: italic; font-size: 0.9em',
    }
});
```

or

```javascript
const css = ConsoleFormattedStream.getDefaultCss();
css.msg = 'color: cyan';
new ConsoleFormattedStream({ css });
```

#### Console Raw Stream

This logs the raw log record objects directly to the console.

```javascript
import { createLogger, INFO } from 'browser-bunyan';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';

const log = createLogger({
    name: 'myLogger',
    stream: {
        level: INFO,
        stream: new ConsoleRawStream(),
    }
});
```

#### Console Plain Stream

This stream is similar to `ConsoleFormattedStream` but does not have colors. This
is useful for environments where the console does not support
 [console styling with CSS (`%c`)](https://developers.google.com/web/tools/chrome-devtools/console/console-write#styling_console_output_with_css).

```javascript
import { createLogger, INFO } from 'browser-bunyan';
import { ConsolePlainStream } from '@browser-bunyan/console-plain-stream';

const log = createLogger({
    name: 'myLogger',
    stream: {
        level: INFO,
        stream: new ConsolePlainStream()
    }
});
```

##### logByLevel

The `logByLevel` option is supported in the same way as [`ConsoleFormattedStream`](#logByLevel).

### Additional log streams

These streams are not built in to the main Browser Bunyan build. You must install them
separately.

#### Server Stream

The Server Stream sends log records to a server endpoint. You will typically want
to set the log level for server streams to `warn`, `error` or `fatal` - log records
that are for exceptions.

##### Install

`npm install @browser-bunyan/server-stream`

To use as a gloabl include the script tag:

```html
<script src="https://unpkg.com/@browser-bunyan/server-stream@1.4.0/lib/index.umd.js"></script>
```

##### Usage

```javascript
import { createLogger, WARN } from 'browser-bunyan';
import { ServerStream } from '@browser-bunyan/server-stream';


const log = createLogger({
    name: 'serverLogger',
    stream: {
        level: WARN,
        stream: new ServerStream({
            url: '/client-log',
            method: 'PUT',
        }),
    },
});
```

##### Notes

* The browser's current url and user agent string will automatically be appended to the
log record.
* Log records are sent to the server in JSON batches (an array of record objects) at a defined `throttleInterval`.
* If, within a batch, a log message is duplicated, that log record will be deduped and a `count` field is incremented for the single log record
* The `flushOnClose` option will flush any unsent log records if the browser window/tab is closed.
Internally this uses [`Navigator.sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) which has [some caveats](https://bugs.chromium.org/p/chromium/issues/detail?id=490015) you should be aware of before enabling it:
  * It will only work if the `method` option is set to `"POST"`
  * The payload must currently be sent as `text/plain` so the server endpoint must be configured
to parse plain text json payloads.
* A `writeCondition` function determines if the latest batch of records should
be sent. By default, log records will not be sent if the browser is offline
(`navigator.onLine === false`) or the current user agent is determined to be a bot/crawler. You may add your own write conditions in addition to the default conditions like so:

  ```javascript
  new ServerLogStream({
     url: '/client-log',
     method: 'POST',
     writeCondition: record => {
        return ServerLogStream.defaultWriteCondition() && record.msg !== 'GrikkleGrass';
     },
  })
  ```

##### Options

| Option              | Default    | Description |
| ------------------- |----------- | ------------------------------------------------- |
| `url`               | /log       | Endpoint to send log record batches to (as JSON) |
| `method`            | PUT        | HTTP method to send record payload with |
| `withCredentials`   | `false`    | `withCredentials` property of the underlying `XMLHttpRequest` object |
| `throttleInterval`  | 3000       | How often to send log record batches (ms) |
| `writeCondition`    | `ServerLogStream.defaultWriteCondition` | A function which must return a boolean. `true` if the log record can be written. i.e. included in the next batch to send. |
| `onError`           | -          | A handler function to invoke if the send request fails |
| `flushOnClose`      | `false`    | **Experimental** Send unsent log records if the browser window is closed |


### Custom log streams

See the Node Bunyan docs below for more information on how to create you own custom stream(s). 

This [gist for a "server-stream"](https://gist.github.com/philmander/7788b680acb776bab4ae67df63db227a) is also good example of how to write a log stream that sends log records to the server. 

## Browser specific features

#### Logging objects to the console

As per, Bunyan's [log API](#log-method-api), if you log an object under the
field `obj` as the first argument, Browser Bunyan's built-in log streams will log this object
directly to the console:

```
var myObject = { x: 1, y: 2 };
logger.info({ obj: myObject }, 'This is my object:');
```

#### Stream types

Node Bunyan supports various [types of streams](#streams-introduction). In Browser Bunyan, streams
are always of type 'raw'.

## Features shared with Node Bunyan

**The following docs are the [node-bunyan](https://github.com/trentm/node-bunyan) docs at time of forking, with necessary
modifications and documentation for the stripped features also removed:**

### Overview of features

- elegant [log method API](#log-method-api)
- extensible [streams](#streams) system for controlling where log records
  go (to the console, local storage, the server, etc)
  [`src: true`](#src)
- lightweight specialization of Logger instances with [`log.child`](#logchild)
- custom rendering of logged objects with ["serializers"](#serializers)


### Introduction

Like most logging libraries you create a Logger instance and call methods
named after the logging levels:

```javascript
const { createLogger } = require('browser-bunyan');
const log = createLogger({name: 'myapp'});
log.info('hi');
log.warn({lang: 'fr'}, 'au revoir');
```
All loggers must provide a "name". This is somewhat akin to the log4j logger
"name", but Bunyan doesn't do hierarchical logger names.

**Bunyan log records are JSON.** A few fields are added automatically:
"time" and "v".

```json
    {"name":"myapp","hostname":"banana.local","pid":40161,"level":30,"msg":"hi","time":"2013-01-04T18:46:23.851Z","v":0}
    {"name":"myapp","hostname":"banana.local","pid":40161,"level":40,"lang":"fr","msg":"au revoir","time":"2013-01-04T18:46:23.853Z","v":0}
```

### Log Method API

The example above shows two different ways to call `log.info(...)`. The
full API is:

```javascript
log.info();     // Returns a boolean: is the "info" level enabled?
                // This is equivalent to `log.isInfoEnabled()` or
                // `log.isEnabledFor(INFO)` in log4j.

log.info('hi');                     // Log a simple string message (or number).
log.info('hi %s', bob, anotherVar); // Uses `util.format` for msg formatting.

log.info({foo: 'bar'}, 'hi');
                // Adds "foo" field to log record. You can add any number
                // of additional fields here.

log.info(err);  // Special case to log an `Error` instance to the record.
                // This adds an "err" field with exception details
                // (including the stack) and sets "msg" to the exception
                // message.
log.info(err, 'more on this: %s', more);
                // ... or you can specify the "msg".
```

Note that this implies **you cannot pass any object as the first argument
to log it**. IOW, `log.info(mywidget)` may not be what you expect. Instead
of a string representation of `mywidget` that other logging libraries may
give you, Bunyan will try to JSON-ify your object. It is a Bunyan best
practice to always give a field name to included objects, e.g.:

    log.info({widget: mywidget}, ...)

This will dove-tail with [Bunyan serializer support](#serializers), discussed
later.

The same goes for all of Bunyan's log levels: `log.trace`, `log.debug`,
`log.info`, `log.warn`, `log.error`, and `log.fatal`. See the [levels section](#levels)
below for details and suggestions.

### Streams Introduction

By default, log output is to the browser console and at the "info" level. Explicitly that
looks like:

```javascript
import { createLogger, ConsoleRawStream } from 'browser-bunyan';
var log = createLogger({
    name: 'myapp',
    stream: new ConsoleRawStream()
    level: 'info'
});
```

That is an abbreviated form for a single stream. **You can define multiple
streams at different levels**.

```javascript
const log = createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'info',
      stream: new ConsoleRawStream()  // log INFO and above to console
    },
    {
      level: 'error',
      path: new PostToServerStream()  // record errors on the server
    }
  ]
});
```

More on streams in the [Streams section](#streams) below.


### log.child

Bunyan has a concept of a child logger to **specialize a logger for a
sub-component of your application**, i.e. to create a new logger with
additional bound fields that will be included in its log records. A child
logger is created with `log.child(...)`.

In the following example, logging on a "Wuzzle" instance's `this.log` will
be exactly as on the parent logger with the addition of the `widget_type`
field:

```javascript
    const { createLogger } = require('browser-bunyan');
    const log = createLogger({name: 'myapp'});

    function Wuzzle(options) {
        this.log = options.log.child({widget_type: 'wuzzle'});
        this.log.info('creating a wuzzle')
    }
    Wuzzle.prototype.woos = function () {
        this.log.warn('This wuzzle is woosey.')
    }

    log.info('start');
    var wuzzle = new Wuzzle({log: log});
    wuzzle.woos();
    log.info('done');
```

Running that looks like (raw):

```json
{"name":"myapp","level":30,"msg":"start","time":"2013-01-04T07:47:25.814Z"}
{"name":"myapp","widget_type":"wuzzle","level":30,"msg":"creating a wuzzle","time":"2013-01-04T07:47:25.815Z"}
{"name":"myapp","widget_type":"wuzzle","level":40,"msg":"This wuzzle is woosey.","time":"2013-01-04T07:47:25.815Z"}
{"name":"myapp","level":30,"msg":"done","time":"2013-01-04T07:47:25.816Z"}
```

### Serializers

Bunyan has a concept of **"serializers" to produce a JSON-able object from a
JavaScript object**, so you can easily do the following:

    log.info({req: <request object>}, 'something about handling this request');

Serializers is a mapping of log record field name, "req" in this example, to
a serializer function. That looks like this:

```javascript
function reqSerializer(req) {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers
    }
}

const log = createLogger({
    name: 'myapp',
    serializers: {
        req: reqSerializer
    }
});
```

Or this:
```javascript
import { createLogger, stdSerializers } from 'browser-bunyan';

const log = createLogger({
    name: 'myapp',
    serializers: {req: stdSerializers.req}
});
```

because Bunyan includes a small set of standard serializers. To use all the
standard serializers you can use:

```javascript
    import { createLogger, stdSerializers } from 'browser-bunyan';
    const log = createLogger({
      ...
      serializers: stdSerializers
    });
```

**Note**: Your own serializers should never throw, otherwise you'll get an
ugly message on stderr from Bunyan (along with the traceback) and the field
in your log record will be replaced with a short error message.

### Levels

The log levels in bunyan are as follows. The level descriptions are best
practice *opinions*.

- `fatal` (60): The service/app is going to stop or become unusable now.
  An operator should definitely look into this soon.
- `error` (50): Fatal for a particular request, but the service/app continues
  servicing other requests. An operator should look at this soon(ish).
- `warn` (40): A note on something that should probably be looked at by an
  operator eventually.
- `info` (30): Detail on regular operation.
- `debug` (20): Anything else, i.e. too verbose to be included in "info" level.
- `trace` (10): Logging from external libraries used by your app or *very*
  detailed application logging.

Suggestions: Use "debug" sparingly. Information that will be useful to debug
errors *post mortem* should usually be included in "info" messages if it's
generally relevant or else with the corresponding "error" event. Don't rely
on spewing mostly irrelevant debug messages all the time and sifting through
them when an error occurs.

Integers are used for the actual level values (10 for "trace", ..., 60 for
"fatal") and constants are defined for the (bunyan.TRACE ... bunyan.DEBUG).
The lowercase level names are aliases supported in the API.

Here is the API for changing levels in an existing logger:

```javascript
log.level() -> INFO   // gets current level (lowest level of all streams)

log.level(INFO)       // set all streams to level INFO
log.level("info")     // set all streams to level INFO

log.levels() -> [DEBUG, INFO]   // get array of levels of all streams
log.levels(0) -> DEBUG          // get level of stream at index 0
log.levels("foo")               // get level of stream with name "foo"

log.levels(0, INFO)             // set level of stream 0 to INFO
log.levels(0, "info")           // can use "info" et al aliases
log.levels("foo", WARN)         // set stream named "foo" to WARN
```


### Log Record Fields

This section will describe *rules* for the Bunyan log format: field names,
field meanings, required fields, etc. However, a Bunyan library doesn't
strictly enforce all these rules while records are being emitted. For example,
Bunyan will add a `time` field with the correct format to your log records,
but you can specify your own. It is the caller's responsibility to specify
the appropriate format.

The reason for the above leniency is because IMO logging a message should
never break your app. This leads to this rule of logging: **a thrown
exception from `log.info(...)` or equivalent (other than for calling with the
incorrect signature) is always a bug in Bunyan.**


A typical Bunyan log record looks like this:

```json
{"name":"myapp","req":{"method":"GET","url":"/path?q=1#anchor","headers":{"x-hi":"Mom","connection":"close"}},"level":3,"msg":"start request","time":"2012-02-03T19:02:46.178Z","v":0}
```

Pretty-printed:

```json
{
  "name": "myapp",
  "req": {
    "method": "GET",
    "url": "/path?q=1#anchor",
    "headers": {
      "x-hi": "Mom",
      "connection": "close"
    },
    "remoteAddress": "120.0.0.1",
    "remotePort": 51244
  },
  "level": 3,
  "msg": "send request",
  "time": "2012-02-03T19:02:57.534Z",
  "v": 0
}
```

Core fields:

- `v`: Required. Integer. Added by Bunyan. Cannot be overriden.
  This is the Bunyan log format version (`require('bunyan').LOG_VERSION`).
  The log version is a single integer. `0` is until I release a version
  "1.0.0" of node-bunyan. Thereafter, starting with `1`, this will be
  incremented if there is any backward incompatible change to the log record
  format. Details will be in "CHANGES.md" (the change log).
- `level`: Required. Integer. Added by Bunyan. Cannot be overriden.
  See the "Levels" section.
- `name`: Required. String. Provided at Logger creation.
  You must specify a name for your logger when creating it. Typically this
  is the name of the service/app using Bunyan for logging.
- `time`: Required. String. Added by Bunyan. Can be overriden.
  The date and time of the event in [ISO 8601
  Extended Format](http://en.wikipedia.org/wiki/ISO_8601) format and in UTC,
  as from
  [`Date.toISOString()`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toISOString).
- `msg`: Required. String.
  Every `log.debug(...)` et al call must provide a log message.
- `src`: Optional. Object giving log call source info. This is added
  automatically by Bunyan if the "src: true" config option is given to the
  Logger. Never use in production as this is really slow.


Go ahead and add more fields, and nested ones are fine (and recommended) as
well. This is why we're using JSON. Some suggestions and best practices
follow (feedback from actual users welcome).


Recommended/Best Practice Fields:

- `err`: Object. A caught JS exception. Log that thing with `log.info(err)`
    to get:

```
        "err": {
          "message": "boom",
          "name": "TypeError",
          "stack": "TypeError: boom\n    at Object.<anonymous> ..."
        },
        "msg": "boom",
```

    Or use the `bunyan.stdSerializers.err` serializer in your Logger and
    do this `log.error({err: err}, "oops")`. See "examples/err.js".

### Streams

A "stream" is Bunyan's name for an output for log messages (the equivalent
to a log4j Appender). A Bunyan Logger instance has one or more streams.
In general streams are specified with the "streams" option:

```javascript
const bunyan = require('browser-bunyan');
const log = createLogger({
    name: "foo",
    streams: [
        {
            stream: new ConsoleRawStream(),
            level: "debug"
        },
        ...
    ]
});
```

For convenience, if there is only one stream, it can specified with the
"stream" and "level" options (internally converted to a `Logger.streams`).

```javascript
const log = createLogger({
    name: "foo",
    stream: new ConsoleRawStream(),
    level: "debug"
});
```

If neither "streams" nor "stream" are specified, the default is a stream of
type `ConsoleRawStream` at the "info" level.

### stream type: `raw`

Note that in browser-bunyan streams are always `raw`


## Inegrations

### Angular 1.x integration:

Integrate with Angular's log provider:

```javascript
adminApp.config(function($provide) {
    $provide.decorator('$log', function($delegate) {
        $delegate = bunyan.createLogger({
            name: 'myLogger',
            streams: [{
                level: 'info',
                stream: new bunyan.ConsoleFormattedStream(),
            }]
        });
        return $delegate;
    });
});
```

## License

MIT. See LICENSE.
