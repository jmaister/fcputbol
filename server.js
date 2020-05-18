// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const bent = require('bent');
const getJSON = bent('json')

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

var CronJob = require('cron').CronJob;
var job = new CronJob(
    // Every 5 min, not CRON compliant
	'0 */5 * * * *',
	async () => {
        console.log('Running cron job...', new Date().toISOString());
        const urlPrefix = process.env.NEXT_PUBLIC_SERVER_URL;

        try {
            const freezeResponse = await getJSON(urlPrefix + '/api/freezelineups');
            console.log("Freeze OK", freezeResponse);
        } catch (error) {
            console.log("Freeze ERROR", error);
        }

        try {
            const processMatchesResponse = await getJSON(urlPrefix + '/api/processmatches');
            console.log("Process matches OK", processMatchesResponse);
        } catch (error) {
            console.log("Process matches ERROR", error);
        }

		console.log('Finished cron job');
	}
);
setTimeout(()=> {
    job.start();
}, 20000);

app.prepare().then(() => {
    createServer((req, res) => {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        //const { pathname, query } = parsedUrl

        //if (pathname === '/a') {
        //    app.render(req, res, '/b', query)

        handle(req, res, parsedUrl);

    }).listen(3300, err => {
        if (err) throw err
        console.log('> Ready on http://localhost:3300');
    })
})
