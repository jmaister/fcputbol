import { getSession } from 'lib/iron';
import { saveLineup } from 'lib/TeamService';

export default async function savelineup(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const userId = session.id;
            const response = await saveLineup(req.body.teamId, req.body.playerIds, userId);
            res.status(200).json({ ok: true, data: response });
        } catch (error) {
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
