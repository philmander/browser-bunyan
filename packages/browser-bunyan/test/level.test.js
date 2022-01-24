/*
 * Copyright (c) 2014 Trent Mick. All rights reserved.
 *
 * Test the `log.level(...)`.
 */

import { createLogger, FATAL, ERROR, INFO, DEBUG, TRACE } from '../src/index.js';

var p = console.log;

import { test, beforeEach as before, afterEach as after } from "tap";

const __dirname = new URL('.', import.meta.url).pathname;

// ---- test boolean `log.<level>()` calls

var log1 = createLogger({
    name: 'log1',
    streams: [
        {
            path: __dirname + '/level.test.log1.log',
            level: 'info'
        }
    ]
});


test('log.level() -> level num', function (t) {
    t.equal(log1.level(), INFO);
    t.end();
});

test('log.level(<const>)', function (t) {
    log1.level(DEBUG);
    t.equal(log1.level(), DEBUG);
    t.end();
});

test('log.level(<num>)', function (t) {
    log1.level(10);
    t.equal(log1.level(), TRACE);
    t.end();
});

test('log.level(<name>)', function (t) {
    log1.level('error');
    t.equal(log1.level(), ERROR);
    t.end();
});

// A trick to turn logging off.
// See <https://github.com/trentm/node-bunyan/pull/148#issuecomment-53232979>.
test('log.level(FATAL + 1)', function (t) {
    log1.level(FATAL + 1);
    t.equal(log1.level(), FATAL + 1);
    t.end();
});

test('log.level(<weird numbers>)', function (t) {
    log1.level(0);
    t.equal(log1.level(), 0);
    log1.level(Number.MAX_VALUE);
    t.equal(log1.level(), Number.MAX_VALUE);
    t.end();
});
