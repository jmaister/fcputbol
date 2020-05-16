
import { playAndSaveMatch, findMatchToPlay } from 'lib/MatchService';

import moment from 'moment';
import { RoundStatus, Round } from 'db/entity/round.entity';
import { findRoundByStatus, saveRound } from 'lib/RoundService';

interface RoundProcessInfo {
    roundId: number
    processedMatches: number
    totalMatches: number
    errors: any[]
    errorCount: number
}

export default async function playMatches(req, res) {

    // TODO: freeze lineups

    if (req.method === 'GET') {
        const now = moment().toDate();
        const status = RoundStatus.SCHEDULED;
        try {
            const rounds:Round[] = await findRoundByStatus(now, status);
            const roundsCount = rounds.length;
            let processedRounds = 0;
            const infoList:RoundProcessInfo[] = [];

            for (let i=0; i<rounds.length; i++) {
                const round = rounds[i];

                const errors = [];
                let processedMatches = 0;
                let roundErrorCount = 0;

                for (let m=0; m<round.matches.length; m++) {
                    console.log("match-a", round.matches[m]);
                    const matchId = round.matches[m].id;
                    console.log("match-b", matchId)
                    const match = await findMatchToPlay(matchId);
                    try {
                        await playAndSaveMatch(match);
                    } catch (error) {
                        console.log(error);
                        errors.push("Failed match id " + match.id + ": " + error.message);
                        roundErrorCount++;
                    }
                    processedMatches++;
                }

                // TODO: update league current match

                if (roundErrorCount === 0) {
                    round.status = RoundStatus.FINISHED;
                    round.finishDate = moment().toDate();
                    await saveRound(round);
                }
                const info:RoundProcessInfo = {
                    roundId: round.id,
                    errorCount: roundErrorCount,
                    errors: errors,
                    processedMatches: processedMatches,
                    totalMatches: round.matches.length,
                };
                infoList.push(info);
                processedRounds++;
            }

            res.status(200).json({ok: true, processedRounds, roundsToProcess: roundsCount, infoList});
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
