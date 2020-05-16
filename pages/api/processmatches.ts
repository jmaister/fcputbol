
import { playMatch, findMatchToPlay } from 'lib/MatchService';

import moment from 'moment';
import { RoundStatus, Round } from 'db/entity/round.entity';
import { findRoundByStatus, saveRound } from 'lib/RoundService';

export default async function playMatches(req, res) {

    // TODO: freeze lineups

    if (req.method === 'GET') {
        const now = moment().toDate();
        const status = RoundStatus.SCHEDULED;
        try {
            const rounds:Round[] = await findRoundByStatus(now, status);
            const roundsCount = rounds.length;
            let processedRounds = 0;
            let processedMatches = 0;
            for (let i=0; i<rounds.length; i++) {
                const round = rounds[i];

                for (let m=0; m<round.matches.length; m++) {
                    const matchId = round.matches[m].id;
                    const match = await findMatchToPlay(matchId);
                    await playMatch(match);
                    processedMatches++;
                }

                // TODO: update league current match

                round.status = RoundStatus.FINISHED;
                round.finishDate = moment().toDate();
                await saveRound(round);
                processedRounds++;
            }

            res.status(200).json({ok: true, processedMatches, processedRounds, roundsToProcess: roundsCount});
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
