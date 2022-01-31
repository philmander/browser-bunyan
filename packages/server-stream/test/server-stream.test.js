/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test `type: 'raw'` Logger streams.
 */
global.window = {
    navigator: {
        onLine: true,
        userAgent: 'chrime',
    },
    location: {
        href: '/wizzle-wuzzle-wup'
    }
};

import { test, only } from "tap";

import { ServerStream } from '../src/index.js';

import { setTimeout } from 'timers/promises';

import MockXMLHttpRequest from 'mock-xmlhttprequest';
import { resolve } from "path";

const MockXhr = MockXMLHttpRequest.newMockXhr();
global.XMLHttpRequest = MockXhr;

test('default behavior', async function (t) {
    let reqCount = 0;
    const end = new Promise(resolve => {
        MockXhr.onSend = xhr => {
            t.equal(xhr.url, '/log');
            t.equal(xhr.method, 'PUT');
            t.equal(xhr.withCredentials, false);
            reqCount++;
            if(reqCount === 1) {
                
                const reqs = JSON.parse(xhr.body);
                t.equal(reqs.length, 2);
                t.equal(reqs[0].msg, 'one');
                t.equal(reqs[0].count, 2);
                t.equal(reqs[1].msg, 'two');
                t.equal(reqs[1].count, 1);
                t.equal(reqs[1].two, 'deux');
                xhr.respond(204);
            }
    
            if(reqCount === 2) {
                const reqs = JSON.parse(xhr.body);
                t.equal(reqs.length, 2);
                t.equal(reqs[0].msg, 'three');
                t.equal(reqs[1].msg, 'four');  
                resolve();           
            }
        };
    });

    const throttleInterval = 100;
    const stream = new ServerStream({ throttleInterval });

    stream.write({ msg: 'one' });
    stream.write({ msg: 'one' });
    stream.write({ two: 'deux', msg: 'two'});

    await setTimeout(throttleInterval + 50);
    stream.write({ msg: 'three' });
    stream.write({ msg: 'four'});

    return end;
});

test('customize behavior', async function (t) {
    const end = new Promise(resolve => {
        MockXhr.onSend = xhr => {
            t.equal(xhr.url, '/things');
            t.equal(xhr.method, 'POST');
            t.equal(xhr.withCredentials, true);

            const reqs = JSON.parse(xhr.body);
            t.equal(reqs.length, 3);

            resolve();
        };
    });

    const stream = new ServerStream({
        throttleInterval: 10,
        method: 'POST',
        url: '/things',
        withCredentials: true,
    });
    stream.write({ msg: 'one' });
    stream.write({ msg: 'two' });
    stream.write({ msg: 'three' });
    return end;
});

test('does not attempt to log offline', async function (t) {
    window.navigator.onLine = false;
    let reqSent = false;
    MockXhr.onSend = () => {
        // this shouldn't happen
        reqSent = true;
    };

    const throttleInterval = 100;
    const stream = new ServerStream({
        throttleInterval,
    });

    await setTimeout(throttleInterval + 50);
    t.equal(reqSent, false);
    window.navigator.onLine = true;
    stream.stop();
});

test('custom xhr error handler', async function (t) {
    MockXhr.onSend = xhr => {
        xhr.respond(400);
    };

    const end = new Promise((resolve, reject) => {
        const stream = new ServerStream({
            throttleInterval: 100,
            onError: function(records, xhr) {
                t.equal(xhr.url, '/log');
                t.equal(records.length, 1);
                this.stop();
                resolve();
            },
        });
        stream.write({ msg: 'one' });
    });
    return end;
});

test('add custom request headers', async function (t) {
    const end = new Promise((resolve) => {
        MockXhr.onSend = xhr => {
            t.equal(xhr.requestHeaders.getAll().trim(), 'authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==\r\ncontent-type: application/json');
            resolve();
        };
    });

    const stream = new ServerStream({
        headers: {
            'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
        }
    });
    stream.write({ foo: 'bar' });
    return end;
});

test('add custom request headers: override content-type', async function (t) {
    const end = new Promise((resolve) => {
        MockXhr.onSend = xhr => {
            t.equal(xhr.requestHeaders.getAll().trim(), 'authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==\r\ncontent-type: text/json');
            resolve();
        };
    });

    const stream = new ServerStream({
        headers: {
            'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
            'Content-Type': 'text/json',
        }
    });
    stream.write({ foo: 'bar' });
    return end;
});