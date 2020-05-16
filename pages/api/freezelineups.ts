
import { freezeLineups } from 'lib/MatchService';

import moment from 'moment';
import { RoundStatus } from 'db/entity/round.entity';

export default async function freezelineups(req, res) {

    if (req.method === 'GET') {
        const now = moment().toDate();
        try {
            const response = await freezeLineups(now);

            res.status(200).json({ok: true, response});
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ ok: false, error: error });
        }
    } else {
        res.status(400).json({ ok: false, error: "not supported yet" });
    }
}
