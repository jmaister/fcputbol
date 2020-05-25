import { useUser } from 'lib/hooks';
import { getSession } from 'lib/iron';
import { findUser } from 'lib/UserService';

import { List, ListItem, Link } from '@material-ui/core';

import Layout from 'components/layout';

import { User } from 'db/entity/user.entity';
import { League } from 'db/entity/league.entity';
import { findUserLeagues } from 'lib/LeagueService';


export interface HomeProps {
    user: User,
    leagues: League[]
}

export default function Home({user, leagues}:HomeProps) {
    // const user = useUser();

    return (
        <Layout>
            <h1>FC Pútbol</h1>

            <p>Juego inspirado en el mítico PC Fútbol</p>

            <p>1. Crea una cuenta</p>
            <p>2. Crea una liga o consigue el código para entrar en una</p>
            <p>3. ¡¡ Jugar !!</p>

            {user?<>
                <h2>Ligas en las que participas</h2>
                <List>
                    {leagues.map(l => (
                        <ListItem key={l.id}>
                            <Link href={"/league/" + l.id}><a>{l.id}_{l.name}</a></Link>
                        </ListItem>
                    ))}
                </List>

            </>:null}
        </Layout>
    )
}


export async function getServerSideProps({req, res}) {
    const session = await getSession(req);

    let user = null;
    let leagues = null;
    if (session && session.id) {
        user = await findUser(session.id);
        // Hack
        user = JSON.parse(JSON.stringify(user));

        leagues = await findUserLeagues(session.id);
        // Hack
        leagues = JSON.parse(JSON.stringify(leagues));
    }

    return {
        props: {
            user,
            leagues
        }
    };
}
