import { getSession } from '../../lib/iron';
import { play, MatchResult } from '../../lib/play/probs';
import { Match } from 'db/entity/match.entity';

import { findTeam } from '../../lib/TeamService';
import { saveMatch } from '../../lib/MatchService';

export default async function playMatch(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            // Query teams
            const home = await findTeam(req.body.home);
            const away = await findTeam(req.body.away);

            // Play a match
            const result: MatchResult = play(home, away);

            const match = {
                home,
                away,
                homeLineup: home.lineup,
                awayLineup: away.lineup,
                resultHome: result.score[0],
                resultAway: result.score[1],
            } as Match;

            const savedMatch = await saveMatch(match, result.steps);

            res.status(200).json({ ok: true, matchId: savedMatch.id, home, away });
        } catch (error) {
            console.log("playMatch", error);
            res.status(404).json({ ok: false, message: "Error on playMatch.", body: req.body, error: error });
        }

    } else {
        res.status(400).json({ message: "not supported yet" });
    }

}


