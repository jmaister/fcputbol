import { Match, MatchStatus } from 'db/entity/match.entity';

import { playMatch, findMatchesByStatus } from 'lib/MatchService';

import moment from 'moment';

export default async function playMatches(req, res) {

    if (req.method === 'GET') {
        const now = moment().toDate();
        const status = MatchStatus.SCHEDULED;
        try {
            const matches:Match[] = await findMatchesByStatus(now, status);
            const matchesCount = matches.length;
            let processed = 0;
            for (let i=0; i<matches.length; i++) {
                await playMatch(matches[i]);
                processed++;
            }

            res.status(200).json({ok: true, processed: processed, toProcess: matchesCount});
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
