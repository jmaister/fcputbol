
import { playRounds } from 'lib/RoundService';

export default async function playMatches(req, res) {

    if (req.method === 'GET') {
        const now = new Date();
        try {
            const response = await playRounds(now);
            res.status(200).json(response);
        } catch (error) {
            console.log("Error playMatches", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
