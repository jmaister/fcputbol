import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';
import TeamName from '../components/team/TeamName';

import { findUser } from '../lib/UserService';

import { Button, List, ListItem } from '@material-ui/core';
import { getSession } from 'lib/iron';


export default function TeamsPage({user}) {
    const [errorMsg, setErrorMsg] = useState('');

    return <Layout>
        <h1>Equipos</h1>

        <Link href="/createteam">
            <Button
                variant="contained"
                color="primary">
                    Crear nuevo equipo
            </Button>
        </Link>

        <h2>Tus equipos:</h2>
        <List>
        {user.teams.map(t => (
            <ListItem key={t.id}>
                <TeamName team={t} user={user} />
            </ListItem>
        ))}
        </List>

    </Layout>
}

export async function getServerSideProps(context) {
    const session = await getSession(context.req);
    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    return {
        props: {
            user
        }
    };
}
