import { useState } from 'react'

import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Link from 'next/link';

import Layout from '../../components/layout';
import { findUser } from '../../lib/user';
import Router from 'next/router'

interface MatchResultParams {
    id: string
}

export default function MatchResult({id}:MatchResultParams) {
    const [errorMsg, setErrorMsg] = useState('');


    return <Layout>
        <h1>Resultado del partido</h1>
        id: /{id}/

        {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}
    </Layout>
}

export async function getServerSideProps(context) {
    const matchId = context.params.id;

    return {
        props: {
            id: matchId
        }
    };
}
