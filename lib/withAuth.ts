import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from './iron';
import { redirectToLogin } from './serverutils';


export function withAuthSSP(handler) {
    console.log("creating wrapper withAuthSSP");
    return async function(context) {
        const session = await getSession(context.req);
        console.log("session", session);
        if (!session) {
            redirectToLogin(context.res);
            return {};
        }
        const ret = handler(context);
        console.log("returned", ret);
        return ret;
    }
}



export function withAuthAPI(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ name: 'John Doe' });
}
