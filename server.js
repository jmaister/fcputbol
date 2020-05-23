// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const bent = require('bent');
const getJSON = bent('json');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Must be read after next()
const PORT = process.env.FC_PORT;
const startJobs = process.env.START_JOBS === 'true';

if (startJobs) {
    const jobs = [
        {name: "Freeze Lineups", url: '/api/jobs/freezelineups'},
        {name: "Process Matches", url: '/api/jobs/processmatches'},
        {name: "Create Market", url: '/api/jobs/createmarket'},
    ];

    console.log("Processing jobs will start.");
    const CronJob = require('cron').CronJob;
    const job = new CronJob(
        // Every 5 min, not CRON compliant
        '0 */5 * * * *',
        async () => {
            console.log('Running cron job...', new Date().toISOString());
            const urlPrefix = process.env.NEXT_PUBLIC_SERVER_URL;

            for (let job of jobs) {
                try {
                    const response = await getJSON(urlPrefix + job.url);
                    console.log(job.name + " OK", response);
                } catch (error) {
                    console.log(job.name + " ERROR", error);
                }
            }

            console.log('Finished cron job');
        }
    );
    setTimeout(()=> {
        job.start();
    }, 20000);
} else {
    console.log("Processing jobs will NOT start.");
}


app.prepare().then(() => {
    createServer((req, res) => {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);

        handle(req, res, parsedUrl);

    }).listen(PORT, err => {
        if (err) throw err
        console.log('> Ready on http://localhost:'+PORT);
    })
})
