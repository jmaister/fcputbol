import { getSession } from 'lib/iron';
import { saveNewStatPoint } from 'lib/PlayerService';

export default async function addplayerpoint(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const userId = session.id;
            const response = await saveNewStatPoint(req.body.leagueId, userId, req.body.playerId, req.body.points, req.body.stat);
            res.status(200).json({ ok: true, data: response });
        } catch (error) {
            console.log("ERROR on addplayerpoint", error);
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
