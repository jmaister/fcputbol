import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';

import { findUser } from '../lib/UserService';

import { Button } from '@material-ui/core';

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

        <ul>
        {user.teams.map(t => (
            <li key={t.id}>
                <Link  href={'/team/' + t.id}>
                    <a>Ver equipo: {t.name}</a>
                </Link>
            </li>
        ))}
        </ul>

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
