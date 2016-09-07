/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test `type: 'raw'` Logger streams.
 */

var format = require('util').format;
var Logger = require('../lib/bunyan');

// node-tap API
if (require.cache[__dirname + '/tap4nodeunit.js'])
        delete require.cache[__dirname + '/tap4nodeunit.js'];
var tap4nodeunit = require('./tap4nodeunit.js');
var after = tap4nodeunit.after;
var before = tap4nodeunit.before;
var test = tap4nodeunit.test;


function CapturingStream(recs) {
    this.recs = recs;
}
CapturingStream.prototype.write = function (rec) {
    this.recs.push(rec);
}


test('raw stream', function (t) {
    var recs = [];

    var log = new Logger({
        name: 'raw-stream-test',
        streams: [
            {
                stream: new CapturingStream(recs),
                type: 'raw'
            }
        ]
    });
    log.info('first');
    log.info({two: 'deux'}, 'second');

    t.equal(recs.length, 2);
    t.equal(typeof (recs[0]), 'object', 'first rec is an object');
    t.equal(recs[1].two, 'deux', '"two" field made it through');
    t.end();
});