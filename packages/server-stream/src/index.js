const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'no-window';
const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

export class ServerStream {

    constructor(opts = {}) {
        const {
            method = 'PUT',
            url = '/log',
            throttleInterval = 3000,
            withCredentials = false,
            onError,
            flushOnClose = false,
            writeCondition = ServerStream.defaultWriteCondition,
        } = opts;

        this.writeCondition = writeCondition;
        this.records = {};

        this.start({ method, url, throttleInterval, withCredentials, onError });

        // send outstanding records on unload
        // this has some restrictions: browser must support `sendBeacon` and the 
        // method option must be a "POST"
        const sendBeaconSupported = 
            typeof Blob !== undefined && window.navigator.sendBeacon;
        if(flushOnClose && sendBeaconSupported && method.toLowerCase() === 'POST') {
            window.addEventListener('unload', () => {
                if(this.currentThrottleTimeout) {
                    window.clearTimeout(this.currentThrottleTimeout);
                }
                const recs = this.recordsAsArray();
                if(recs.length) {
                    const blob = new Blob([JSON.stringify(recs)], { type : 'text/plain' });
                    navigator.sendBeacon(url, blob);
                }
            }, false);
        }
    }

    start({ method, url, throttleInterval, withCredentials, onError }) {
        const throttleRequests = () => {
            // wait for any errors to accumulate
            this.currentThrottleTimeout = setTimeout(() => {
                const recs = this.recordsAsArray();
                if(recs.length) {
                    const xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = () => {
                        if(xhr.readyState === XMLHttpRequest.DONE) {
                            if(xhr.status >= 400) {
                                if(typeof onError === 'function') {
                                    onError.call(this, recs, xhr);
                                } else {
                                    console.warn('Browser Bunyan: A server log write failed');
                                }
                            }
                            this.records = {};
                            throttleRequests();
                        }
                    };
                    xhr.open(method, url);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.withCredentials = withCredentials;
                    xhr.send(JSON.stringify(recs));
                } else {
                    throttleRequests();
                }
            }, throttleInterval);
        };

        throttleRequests();
    }

    stop() {
        setTimeout(() => {
            if(this.currentThrottleTimeout) {
                clearTimeout(this.currentThrottleTimeout);
                this.currentThrottleTimeout = null;
            }
        }, 1);
    }

    write(rec) {
        rec.url = typeof window !== 'undefined' && window.location.href;
        rec.userAgent = userAgent;
        if(this.currentThrottleTimeout && this.writeCondition(rec)) {
            if(this.records[rec.msg]) {
                this.records[rec.msg].count++;
            } else {
                rec.count = 1;
                this.records[rec.msg] = rec;
            }
        }
    }

    recordsAsArray() {
        return Object.keys(this.records).map(errKey => this.records[errKey]);
    }

    static defaultWriteCondition() {
        return window.navigator.onLine && !isBot;
    }
}