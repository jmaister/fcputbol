
import { freezeLineups } from 'lib/MatchService';

export default async function freezelineups(req, res) {

    if (req.method === 'GET') {
        const now = new Date();
        try {
            const response = await freezeLineups(now);

            res.status(200).json({ok: true, response});
        } catch (error) {
            console.log("Error on freezelineups", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
