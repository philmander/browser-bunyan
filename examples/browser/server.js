const express = require('express');
const { join: joinPaths } = require('path');
const bunyan = require('bunyan-sfdx-no-dtrace');
const app = express();
const port = 3000;
const log = bunyan.createLogger({ name: 'server-log' });
const clientLog = bunyan.createLogger({ name: 'client-log' });

app.use(express.json());
app.use('/static', express.static(joinPaths(__dirname, '../../packages')));

app.get('/', (req, res) => {
    res.sendFile(joinPaths(__dirname + '/index.html'));
});

app.post('/log', (req, res) => {
    log.info('log invoked');
    for (const rec of req.body) {
        clientLog[rec.levelName](`${rec.msg} (${rec.count} times)`);
    }
    res.sendStatus(200);
});

app.listen(port, () => {
    log.info(`Browser Bunyan example running at http://localhost:${port}`)
})