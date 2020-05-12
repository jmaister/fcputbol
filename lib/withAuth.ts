import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from './iron';
import { redirectToLogin } from './serverutils';


export function withAuthSSP(handler) {
    console.log("creating wrapper withAuthSSP");
    return async function(context) {
        const session = await getSession(context.req);
        if (!session) {
            // TODO: add success URL to redirect after login
            redirectToLogin(context.res);
            return {};
        }
        const ret = handler(context);
        return ret;
    }
}


//export function withAuthAPI(req: NextApiRequest, res: NextApiResponse) {
//  res.status(200).json({ name: 'John Doe' });
//}
