import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';

import { findUser } from '../lib/user';

import { Button } from '@material-ui/core';

export default function Team({user}) {
    const [errorMsg, setErrorMsg] = useState('');

    return <Layout>
        <h1>Equipos</h1>

        {user && <p>Currently logged in as: {JSON.stringify(user)}</p>}

        <Link href="/createteam">
            <Button
                variant="contained"
                color="primary">
                    Crear nuevo equipo
            </Button>
        </Link>

        {user.teams.map(t => (
            <Link key={t.id} href={'/team/' + t.id}>
                <a>Ver equipo: {t.name}</a>
            </Link>
        ))}

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
