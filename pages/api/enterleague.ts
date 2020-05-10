import { getSession } from '../../lib/iron';
import { enterLeague } from '../../lib/LeagueService';

export default async function enterleague(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const response = await enterLeague({
                ...req.body,
                userId: session.id
            });
            res.status(200).json({ ok: true, response });
        } catch (error) {
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
