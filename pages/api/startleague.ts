import { getSession } from '../../lib/iron';
import { startLeague } from '../../lib/LeagueService';

export default async function startleague(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const response = await startLeague({
                ...req.body,
                userId: session.id
            });
            res.status(200).json({ ok: true, data: response });
        } catch (error) {
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
