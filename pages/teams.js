
import { useState } from 'react'

import { useUser } from '../lib/hooks';
import Layout from '../components/layout';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Typography } from '@material-ui/core';
import { findUser } from '../lib/user';

const Team = ({user}) => {
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <Layout>
            <h1>Equipos</h1>

            {user && <p>Currently logged in as: {JSON.stringify(user)}</p>}

            {user.teams.lenght === 0 ?
                <div>
                    <Button></Button>
                </div>
            :null}

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
