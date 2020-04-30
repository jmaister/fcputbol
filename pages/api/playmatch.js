import { getSession } from '../../lib/iron';
import { createTeam } from '../../lib/team';

export default async function teams(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        // TODO: query teams
        // TODO: play a match !

        res.status(200).json({ ok: true, matchId: 1 });
    } else {
        res.status(400).json({ message: "not supported yet" });
    }

}
