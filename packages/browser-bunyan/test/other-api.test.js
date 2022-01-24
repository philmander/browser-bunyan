/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test other parts of the exported API.
 */

import { resolveLevel, FATAL, ERROR, WARN, INFO, DEBUG, TRACE } from '../src/index.js';

import { test, beforeEach as before, afterEach as after } from "tap";


test('<LEVEL>s', function (t) {
    t.ok(TRACE, 'TRACE');
    t.ok(DEBUG, 'DEBUG');
    t.ok(INFO, 'INFO');
    t.ok(WARN, 'WARN');
    t.ok(ERROR, 'ERROR');
    t.ok(FATAL, 'FATAL');
    t.end();
});

test('resolveLevel()', function (t) {
    t.equal(resolveLevel('trace'), TRACE, 'TRACE');
    t.equal(resolveLevel('TRACE'), TRACE, 'TRACE');
    t.equal(resolveLevel('debug'), DEBUG, 'DEBUG');
    t.equal(resolveLevel('DEBUG'), DEBUG, 'DEBUG');
    t.equal(resolveLevel('info'), INFO, 'INFO');
    t.equal(resolveLevel('INFO'), INFO, 'INFO');
    t.equal(resolveLevel('warn'), WARN, 'WARN');
    t.equal(resolveLevel('WARN'), WARN, 'WARN');
    t.equal(resolveLevel('error'), ERROR, 'ERROR');
    t.equal(resolveLevel('ERROR'), ERROR, 'ERROR');
    t.equal(resolveLevel('fatal'), FATAL, 'FATAL');
    t.equal(resolveLevel('FATAL'), FATAL, 'FATAL');
    t.end();
});
