import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';

import { findUser } from '../lib/UserService';

import { Button, List, ListItem } from '@material-ui/core';
import { getSession } from 'lib/iron';
import { findUserLeagues } from 'lib/LeagueService';
import { User } from 'db/entity/user.entity';
import { League } from 'db/entity/league.entity';

import { tournament } from 'lib/Tournament';


interface LeaguesParams {
    user: User
    leagues: League[]
}


export default function Leagues({ user, leagues }: LeaguesParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const matches = tournament(4);
    console.log(matches);

    return <Layout>
        <h1>Ligas</h1>

        <Link href="/createleague">
            <Button
                variant="contained"
                color="primary">
                Crear liga
            </Button>
        </Link>

        <h2>Tus ligas:</h2>
        <List>
            {leagues.map(l => (
                <ListItem key={l.id}>
                    <Link href={"/league/" + l.id}><a>{l.id}_{l.name}</a></Link>
                </ListItem>
            ))}
        </List>

        <div>
            {matches.map((m, i) => {
                <div key={i}>{m.map((n, j) => {
                    <span key={j}>{n.home}-{n.away}</span>
                })}</div>
            })}
        </div>
    </Layout>
}

export async function getServerSideProps(context) {
    const session = await getSession(context.req);
    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    // User leagues
    let leagues = await findUserLeagues(session.id);
    // Hack
    leagues = JSON.parse(JSON.stringify(leagues));

    return {
        props: {
            user,
            leagues
        }
    };
}
