import { getSession } from '../../lib/iron';
import { createTeam } from '../../lib/TeamService';

export default async function teams(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const response = await createTeam({
                ...req.body,
                userId: session.id
            });
            res.status(200).json({ ok: true, data: response });
        } catch (error) {
            console.log("Create team error api", error);
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
