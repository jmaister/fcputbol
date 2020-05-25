
import { resolvemarket } from 'lib/MarketService';

export default async function createmarket(req, res) {

    if (req.method === 'GET') {
        const now = new Date();
        try {
            const response = await resolvemarket(now);

            res.status(200).json({ok: true, response});
        } catch (error) {
            console.log("Error on createmarket", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
