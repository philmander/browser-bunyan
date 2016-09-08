[![Build Status](https://travis-ci.org/philmander/browser-bunyan.svg?branch=master)](https://travis-ci.org/philmander/browser-bunyan)

I created this project because I wanted a version of, the awesome logging framework, Bunyan specifically for the 
browser. Although Bunyan does support being browserified, it is still a bit bloated with 
features which aren't relevant in a browser environment.

## Install

Install with NPM or Bower respectively:

`
npm install browser-bunyan --save
`

`
bower install browser-bunyan --save
`

or just copy the script from this repository's `/dist` directory.

## Usage

To use as a **global**, include as a standard script tag:

`<script src=node_modules/browser-bunyan/dist/browser-bunyan.min.js></script>`

now `bunyan` will be available on the `window` object

Or, to use with **Browserify** or **Webpack**:

`
var bunyan = require('browser-bunyan');
`

Naturally, Browser Bunyan can also be *imported* using ES6 module syntax or used with an AMD loader.

### Built-in Log Streams

#### Formatted Log Stream

The core library also includes a dedicated browser console stream with nice formatting. Use it like this:

```javascript
var log = bunyan.createLogger({
    name: 'myLogger',
    streams: [
        {
            level: 'info',
            stream: new bunyan.ConsoleFormattedStream()
        }
    ],
    serializers: bunyan.stdSerializers,
    src: true
});

log.info('hi on info');
```

By default this will use `console.log` for all logging. Pass the option `logByLevel` to the
`ConsoleFormattedStream` to use the Console API's level specific logging methods (`console.info`, `console.warn`, etc). E.g.

`new bunyan.ConsoleFormattedStream( { logByLevel: true } );`

#### Console Raw Stream

This logs the raw log record objects directly to the console.

```javascript
var log = bunyan.createLogger({
    name: 'myLogger',
    stream: {
        level: 'info',
        stream: new bunyan.ConsoleRawStream()
    }
});
```

#### Custom log streams

See the Node Bunyan docs below for more information on how to create you own custom stream(s).

### Angular integration:

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

### Browser specific features

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

=====================================

## Docs from Bunyan

The following docs are the [node-bunyan](https://github.com/trentm/node-bunyan) docs at time of forking, with necessary 
modifications and documentation for the stripped features also removed:

Bunyan is **a simple and fast JSON logging library** for node.js services:

    var bunyan = require('browser-bunyan');
    var log = bunyan.createLogger({name: "myapp"});
    log.info("hi");

and **a `bunyan` CLI tool** for nicely viewing those logs:

![bunyan CLI screenshot](https://raw.github.com/trentm/node-bunyan/master/tools/screenshot1.png)

Manifesto: Server logs should be structured. JSON's a good format. Let's do
that. A log record is one line of `JSON.stringify`'d output. Let's also
specify some common names for the requisite and common fields for a log
record (see below).

Also: log4j is way more than you need.


# Current Status

Solid core functionality is there. Joyent is using this for a number of
production services. Bunyan supports node 0.6 and greater. Follow
<a href="https://twitter.com/intent/user?screen_name=trentmick" target="_blank">@trentmick</a>
for updates to Bunyan.

There is an email discussion list
[bunyan-logging@googlegroups.com](mailto:bunyan-logging@googlegroups.com),
also [as a forum in the
browser](https://groups.google.com/forum/?fromgroups#!forum/bunyan-logging).


# Installation

    npm install browser-bunyan

**Tip**: The `bunyan` CLI tool is written to be compatible (within reason) with
all versions of Bunyan logs. Therefore you might want to `npm install -g bunyan`
to get the bunyan CLI on your PATH, then use local bunyan installs for
node.js library usage of bunyan in your apps.


# Features

- elegant [log method API](#log-method-api)
- extensible [streams](#streams) system for controlling where log records
  go (to a stream, to a file, [log file rotation](#stream-type-rotating-file),
  etc.)
- [`bunyan` CLI](#cli-usage) for pretty-printing and filtering of Bunyan logs
- simple include of log call source location (file, line, function) with
  [`src: true`](#src)
- lightweight specialization of Logger instances with [`log.child`](#logchild)
- custom rendering of logged objects with ["serializers"](#serializers)
- [Runtime log snooping via Dtrace support](#runtime-log-snooping-via-dtrace)
- Support for [browserify](http://browserify.org/). See [Browserify
  section](#browserify) below.


# Introduction

Like most logging libraries you create a Logger instance and call methods
named after the logging levels:

    $ cat hi.js
    var bunyan = require('browser-bunyan');
    var log = bunyan.createLogger({name: 'myapp'});
    log.info('hi');
    log.warn({lang: 'fr'}, 'au revoir');

All loggers must provide a "name". This is somewhat akin to the log4j logger
"name", but Bunyan doesn't do hierarchical logger names.

**Bunyan log records are JSON.** A few fields are added automatically:
"pid", "hostname", "time" and "v".

    $ node hi.js
    {"name":"myapp","hostname":"banana.local","pid":40161,"level":30,"msg":"hi","time":"2013-01-04T18:46:23.851Z","v":0}
    {"name":"myapp","hostname":"banana.local","pid":40161,"level":40,"lang":"fr","msg":"au revoir","time":"2013-01-04T18:46:23.853Z","v":0}


## Log Method API

The example above shows two different ways to call `log.info(...)`. The
full API is:

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


## Streams Introduction

By default, log output is to stdout and at the "info" level. Explicitly that
looks like:

    var log = bunyan.createLogger({
        name: 'myapp',
        stream: process.stdout,
        level: 'info'
    });

That is an abbreviated form for a single stream. **You can define multiple
streams at different levels**.

    var log = bunyan.createLogger({
      name: 'myapp',
      streams: [
        {
          level: 'info',
          stream: process.stdout            // log INFO and above to stdout
        },
        {
          level: 'error',
          path: '/var/tmp/myapp-error.log'  // log ERROR and above to a file
        }
      ]
    });

More on streams in the [Streams section](#streams) below.


## log.child

Bunyan has a concept of a child logger to **specialize a logger for a
sub-component of your application**, i.e. to create a new logger with
additional bound fields that will be included in its log records. A child
logger is created with `log.child(...)`.

In the following example, logging on a "Wuzzle" instance's `this.log` will
be exactly as on the parent logger with the addition of the `widget_type`
field:

    var bunyan = require('browser-bunyan');
    var log = bunyan.createLogger({name: 'myapp'});

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

Running that looks like (raw):

    $ node myapp.js
    {"name":"myapp","hostname":"myhost","pid":34572,"level":30,"msg":"start","time":"2013-01-04T07:47:25.814Z","v":0}
    {"name":"myapp","hostname":"myhost","pid":34572,"widget_type":"wuzzle","level":30,"msg":"creating a wuzzle","time":"2013-01-04T07:47:25.815Z","v":0}
    {"name":"myapp","hostname":"myhost","pid":34572,"widget_type":"wuzzle","level":40,"msg":"This wuzzle is woosey.","time":"2013-01-04T07:47:25.815Z","v":0}
    {"name":"myapp","hostname":"myhost","pid":34572,"level":30,"msg":"done","time":"2013-01-04T07:47:25.816Z","v":0}

And with the `bunyan` CLI (using the "short" output mode):

    $ node myapp.js  | bunyan -o short
    07:46:42.707Z  INFO myapp: start
    07:46:42.709Z  INFO myapp: creating a wuzzle (widget_type=wuzzle)
    07:46:42.709Z  WARN myapp: This wuzzle is woosey. (widget_type=wuzzle)
    07:46:42.709Z  INFO myapp: done


A more practical example is in the
[node-restify](https://github.com/mcavage/node-restify) web framework.
Restify uses Bunyan for its logging. One feature of its integration, is that
if `server.use(restify.requestLogger())` is used, each restify request handler
includes a `req.log` logger that is:

    log.child({req_id: <unique request id>}, true)

Apps using restify can then use `req.log` and have all such log records
include the unique request id (as "req\_id"). Handy.


## Serializers

Bunyan has a concept of **"serializers" to produce a JSON-able object from a
JavaScript object**, so you can easily do the following:

    log.info({req: <request object>}, 'something about handling this request');

Serializers is a mapping of log record field name, "req" in this example, to
a serializer function. That looks like this:

    function reqSerializer(req) {
        return {
            method: req.method,
            url: req.url,
            headers: req.headers
        }
    }
    var log = bunyan.createLogger({
        name: 'myapp',
        serializers: {
            req: reqSerializer
        }
    });

Or this:

    var log = bunyan.createLogger({
        name: 'myapp',
        serializers: {req: bunyan.stdSerializers.req}
    });

because Bunyan includes a small set of standard serializers. To use all the
standard serializers you can use:

    var log = bunyan.createLogger({
      ...
      serializers: bunyan.stdSerializers
    });

**Note**: Your own serializers should never throw, otherwise you'll get an
ugly message on stderr from Bunyan (along with the traceback) and the field
in your log record will be replaced with a short error message.

# Levels

The log levels in bunyan are as follows. The level descriptions are best
practice *opinions*.

- "fatal" (60): The service/app is going to stop or become unusable now.
  An operator should definitely look into this soon.
- "error" (50): Fatal for a particular request, but the service/app continues
  servicing other requests. An operator should look at this soon(ish).
- "warn" (40): A note on something that should probably be looked at by an
  operator eventually.
- "info" (30): Detail on regular operation.
- "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
- "trace" (10): Logging from external libraries used by your app or *very*
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

    log.level() -> INFO   // gets current level (lowest level of all streams)

    log.level(INFO)       // set all streams to level INFO
    log.level("info")     // set all streams to level INFO

    log.levels() -> [DEBUG, INFO]   // get array of levels of all streams
    log.levels(0) -> DEBUG          // get level of stream at index 0
    log.levels("foo")               // get level of stream with name "foo"

    log.levels(0, INFO)             // set level of stream 0 to INFO
    log.levels(0, "info")           // can use "info" et al aliases
    log.levels("foo", WARN)         // set stream named "foo" to WARN



# Log Record Fields

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

    {"name":"myserver","hostname":"banana.local","pid":123,"req":{"method":"GET","url":"/path?q=1#anchor","headers":{"x-hi":"Mom","connection":"close"}},"level":3,"msg":"start request","time":"2012-02-03T19:02:46.178Z","v":0}

Pretty-printed:

    {
      "name": "myserver",
      "hostname": "banana.local",
      "pid": 123,
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
      "msg": "start request",
      "time": "2012-02-03T19:02:57.534Z",
      "v": 0
    }


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
- `pid`: Required. Integer. Filled in automatically at Logger creation.
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

        ...
        "err": {
          "message": "boom",
          "name": "TypeError",
          "stack": "TypeError: boom\n    at Object.<anonymous> ..."
        },
        "msg": "boom",
        ...

    Or use the `bunyan.stdSerializers.err` serializer in your Logger and
    do this `log.error({err: err}, "oops")`. See "examples/err.js".

# Streams

A "stream" is Bunyan's name for an output for log messages (the equivalent
to a log4j Appender). Ultimately Bunyan uses a
[Writable Stream](http://nodejs.org/docs/latest/api/all.html#writable_Stream)
interface, but there are some additional attributes used to create and
manage the stream. A Bunyan Logger instance has one or more streams.
In general streams are specified with the "streams" option:

    var bunyan = require('browser-bunyan');
    var log = bunyan.createLogger({
        name: "foo",
        streams: [
            {
                stream: process.stderr,
                level: "debug"
            },
            ...
        ]
    });

For convenience, if there is only one stream, it can specified with the
"stream" and "level" options (internally converted to a `Logger.streams`).

    var log = bunyan.createLogger({
        name: "foo",
        stream: process.stderr,
        level: "debug"
    });

Note that "file" streams do not support this shortcut (partly for historical
reasons and partly to not make it difficult to add a literal "path" field
on log records).

If neither "streams" nor "stream" are specified, the default is a stream of
type "stream" emitting to `process.stdout` at the "info" level.

## stream type: `raw`

- `raw`: Similar to a "stream" writeable stream, except that the write method
  is given raw log record *Object*s instead of a JSON-stringified string.
  This can be useful for hooking on further processing to all Bunyan logging:
  pushing to an external service, a RingBuffer (see below), etc.
  
Note that in browser-bunyan streams are always `raw`


# Browserify

As the [Browserify](http://browserify.org/) site says it "lets you
`require('modules')` in the browser by bundling up all of your dependencies."
It is a build tool to run on your node.js script to bundle up your script and
all its node.js dependencies into a single file that is runnable in the
browser via:

    <script src="play.browser.js"></script>

As of version 1.1.0, node-bunyan supports being run via Browserify. The
default [stream](#streams) when running in the browser is one that emits
raw log records to `console.log/info/warn/error`.

Here is a quick example showing you how you can get this working for your
script.

1. Get browserify and bunyan installed in your module:


        $ npm install browserify bunyan

2. An example script using Bunyan, "play.js":

    ```javascript
    var bunyan = require('browser-bunyan');
    var log = bunyan.createLogger({name: 'play', level: 'debug'});
    log.trace('this one does not emit');
    log.debug('hi on debug');   // console.log
    log.info('hi on info');     // console.info
    log.warn('hi on warn');     // console.warn
    log.error('hi on error');   // console.error
    ```

3. Build this into a bundle to run in the browser, "play.browser.js":

        $ ./node_modules/.bin/browserify play.js -o play.browser.js

4. Put that into an HTML file, "play.html":

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="play.browser.js"></script>
    </head>
    <body>
      <div>hi</div>
    </body>
    </html>
    ```

5. Open that in your browser and open your browser console:

        $ open play.html


Here is what it looks like in Firefox's console: ![Bunyan + Browserify in the
Firefox console](./docs/img/bunyan.browserify.png)

For some, the raw log records might not be desired. To have a rendered log line
you'll want to add your own stream, starting with something like this:

```javascript
var bunyan = require('./lib/bunyan');

function MyRawStream() {}
MyRawStream.prototype.write = function (rec) {
    console.log('[%s] %s: %s',
        rec.time.toISOString(),
        bunyan.nameFromLevel[rec.level],
        rec.msg);
}

var log = bunyan.createLogger({
    name: 'play',
    streams: [
        {
            level: 'info',
            stream: new MyRawStream(),
            type: 'raw'
        }
    ]
});

log.info('hi on info');
```




# Versioning

The scheme I follow is most succintly described by the bootstrap guys
[here](https://github.com/twitter/bootstrap#versioning).

tl;dr: All versions are `<major>.<minor>.<patch>` which will be incremented for
breaking backward compat and major reworks, new features without breaking
change, and bug fixes, respectively.


# License

MIT. See "LICENSE.txt".