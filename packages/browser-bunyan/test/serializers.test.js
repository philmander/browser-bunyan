/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test the standard serializers in Bunyan.
 */

import { createLogger, stdSerializers } from '../src/index.js';

import { test, beforeEach as before, afterEach as after } from "tap";

function CapturingStream(recs) {
    this.recs = recs;
}
CapturingStream.prototype.write = function (rec) {
    this.recs.push(rec);
}

test('err serializer', function (t) {
    var records = [];
    var log = createLogger({
        name: 'serializer-test',
        streams: [
            {
                stream: new CapturingStream(records),
                type: 'raw'
            }
        ],
        serializers: {
            err: stdSerializers.err
        }
    });

    // None of these should blow up.
    var bogusErrs = [
        undefined,
        null,
        {},
        1,
        'string',
        [1, 2, 3],
        {'foo':'bar'}
    ];
    for (var i = 0; i < bogusErrs.length; i++) {
        log.info({err: bogusErrs[i]}, 'hi');
        t.equal(records[i].err, bogusErrs[i]);
    }

    var theErr = new TypeError('blah');

    log.info(theErr, 'the error');
    var lastRecord = records[records.length-1];
    t.equal(lastRecord.err.message, theErr.message);
    t.equal(lastRecord.err.name, theErr.name);
    t.equal(lastRecord.err.stack, theErr.stack);
    t.end();
});

test('err serializer: custom serializer', function (t) {
    var records = [];

    function customSerializer(err) {
        return {
            message: err.message,
            name: err.name,
            stack: err.stack,
            beep: err.beep
        };
    }

    var log = createLogger({
        name: 'serializer-test',
        streams: [
            {
                stream: new CapturingStream(records),
                type: 'raw'
            }
        ],
        serializers: {
            err: customSerializer
        }
    });

    var e1 = new Error('message1');
    e1.beep = 'bop';
    var e2 = new Error('message2');
    var errs = [e1, e2];

    for (var i = 0; i < errs.length; i++) {
        log.info(errs[i]);
        t.equal(records[i].err.message, errs[i].message);
        t.equal(records[i].err.beep, errs[i].beep);
    }
    t.end();
});


// Bunyan 0.18.3 introduced a bug where *all* serializers are applied
// even if the log record doesn't have the associated key. That means
// serializers that don't handle an `undefined` value will blow up.
test('do not apply serializers if no record key', function (t) {
    var records = [];
    var log = createLogger({
        name: 'serializer-test',
        streams: [ {
                stream: new CapturingStream(records),
                type: 'raw'
        } ],
        serializers: {
            err: stdSerializers.err,
            boom: function (value) {
                throw new Error('boom');
            }
        }
    });

    log.info({foo: 'bar'}, 'record one');
    log.info({err: new Error('record two err')}, 'record two');

    t.equal(records[0].boom, undefined);
    t.equal(records[0].foo, 'bar');
    t.equal(records[1].boom, undefined);
    t.equal(records[1].err.message, 'record two err');

    t.end();
});
