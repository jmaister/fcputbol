import { getSession } from '../../lib/iron';
import { createTeam } from '../../lib/team';

export default async function teams(req, res) {
  const session = await getSession(req);

  if (req.method === 'POST') {
    createTeam({
      ...req.body,
      username: session.username
    }).then(team => {
      res.status(200).json({ok: true});
    }).catch(error => {
      res.status(400).json({ ok: false, error: error });
    });
  } else {
    res.status(400).json({ message: "not supported yet" });
  }

}
