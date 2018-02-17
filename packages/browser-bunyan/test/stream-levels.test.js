/*
 * Copyright (c) 2015 Trent Mick. All rights reserved.
 *
 * Test that streams (the various way they can be added to
 * a Logger instance) get the appropriate level.
 */

import { createLogger, FATAL, ERROR, INFO, DEBUG, TRACE } from '../src/index';
import { test, beforEach as before, afterEach as after } from "babel-tap";

// ---- Tests

test('default stream log level', function (t) {
    var log = createLogger({
        name: 'foo'
    });
    t.equal(log.level(), INFO);
    t.equal(log.streams[0].level, INFO);
    t.end();
});

test('default stream, level=DEBUG specified', function (t) {
    var log = createLogger({
        name: 'foo',
        level: DEBUG
    });
    t.equal(log.level(), DEBUG);
    t.equal(log.streams[0].level, DEBUG);
    t.end();
});

test('default stream, level="trace" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        level: 'trace'
    });
    t.equal(log.level(), TRACE);
    t.equal(log.streams[0].level, TRACE);
    t.end();
});

test('stream & level="trace" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        stream: process.stderr,
        level: 'trace'
    });
    t.equal(log.level(), TRACE);
    t.equal(log.streams[0].level, TRACE);
    t.end();
});

test('one stream, default level', function (t) {
    var log = createLogger({
        name: 'foo',
        streams: [
            {
                stream: process.stderr
            }
        ]
    });
    t.equal(log.level(), INFO);
    t.equal(log.streams[0].level, INFO);
    t.end();
});

test('one stream, top-"level" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        level: 'error',
        streams: [
            {
                stream: process.stderr
            }
        ]
    });
    t.equal(log.level(), ERROR);
    t.equal(log.streams[0].level, ERROR);
    t.end();
});

test('one stream, stream-"level" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        streams: [
            {
                stream: process.stderr,
                level: 'error'
            }
        ]
    });
    t.equal(log.level(), ERROR);
    t.equal(log.streams[0].level, ERROR);
    t.end();
});

test('one stream, both-"level" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        level: 'debug',
        streams: [
            {
                stream: process.stderr,
                level: 'error'
            }
        ]
    });
    t.equal(log.level(), ERROR);
    t.equal(log.streams[0].level, ERROR);
    t.end();
});

test('two streams, both-"level" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        level: 'debug',
        streams: [
            {
                stream: process.stdout,
                level: 'trace'
            },
            {
                stream: process.stderr,
                level: 'fatal'
            }
        ]
    });
    t.equal(log.level(), TRACE, 'log.level()');
    t.equal(log.streams[0].level, TRACE);
    t.equal(log.streams[1].level, FATAL);
    t.end();
});

test('two streams, one with "level" specified', function (t) {
    var log = createLogger({
        name: 'foo',
        streams: [
            {
                stream: process.stdout,
            },
            {
                stream: process.stderr,
                level: 'fatal'
            }
        ]
    });
    t.equal(log.level(), INFO);
    t.equal(log.streams[0].level, INFO);
    t.equal(log.streams[1].level, FATAL);
    t.end();
});
