import Link from 'next/link';

import { useState } from 'react'

import Layout from '../components/layout';

import { findUser } from '../lib/user';

import { Button } from '@material-ui/core';

const Team = ({user}) => {
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <Layout>
            <h1>Equipos</h1>

            {user && <p>Currently logged in as: {JSON.stringify(user)}</p>}

            <div>
                <Link href="/createteam">
                    <Button>Crear nuevo equipo</Button>
                </Link>
            </div>

            {user.teams.map(t => (
                <div key={t.id}>{t.name}</div>
            ))}

        </Layout>
    )
}

export default Team

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
