import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';
import TeamName from '../components/team/TeamName';

import { findUser } from '../lib/UserService';

import { Button, List, ListItem } from '@material-ui/core';


export default function Team({user}) {
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
    // const userSession = useUser();
    const userSession = {id:1};
    let user = await findUser(userSession.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    return {
        props: {
            user
        }
    };
}
