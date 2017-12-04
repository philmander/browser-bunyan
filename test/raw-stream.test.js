/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test `type: 'raw'` Logger streams.
 */

import { Logger } from '../src/index';

import { test, beforEach as before, afterEach as after } from "babel-tap";



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