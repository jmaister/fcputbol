import { getSession } from 'lib/iron';
import { createSeason } from 'lib/SeasonService';

export default async function startseason(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const response = await createSeason({
                ...req.body,
                userId: session.id
            });
            res.status(200).json({ ok: true, data: response });
        } catch (error) {
            console.log("startseason error", error);
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
