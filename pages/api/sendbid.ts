import { getSession } from 'lib/iron';
import { sendBid } from 'lib/MarketService';

export default async function sendbid(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            const userId = session.id;
            const response = await sendBid(req.body.bidPrice, req.body.marketPlayerId, userId);
            if (response.ok) {
                res.status(200).json(response);
            } else {
                res.status(400).json(response);
            }
        } catch (error) {
            console.log("ERROr on sendbid", error);
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
