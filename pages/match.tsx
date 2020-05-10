import { useState } from 'react'
import { Button, Typography } from '@material-ui/core';
import Router from 'next/router'

import Layout from '../components/layout';
import { findUser } from '../lib/UserService';
import TeamSelect from 'components/team/TeamSelect';
import MatchesTable from 'components/match/MatchesTable';

import { getSession } from 'lib/iron';
import { User } from 'db/entity/user.entity';
import { Match } from 'db/entity/match.entity';
import { findMatches } from 'lib/MatchService';


interface MatchPageParams {
    user: User
    matches: Match[]
}

export default function MatchPage({ user, matches }: MatchPageParams) {
    const [errorMsg, setErrorMsg] = useState('');
    const [home, setHome] = useState('');
    const [away, setAway] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const playMatch = async () => {
        setIsLoading(true);

        const body = {
            home,
            away
        }
        try {
            const res = await fetch('/api/playmatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (res.status === 200) {
                const response = await res.json();
                Router.push('/matchresult/' + response.matchId);
            } else {
                setIsLoading(false);
                throw new Error(await res.text())
            }
        } catch (error) {
            setIsLoading(false);
            console.error('An unexpected error happened occurred:', error);
            setErrorMsg(error.message);
        }
    };

    return <Layout>
        <h1>Partido</h1>

        <h2>Selecciona los equipos</h2>
        <TeamSelect id="home-team" teams={user.teams} setValue={setHome} value={home} label="Casa"></TeamSelect>
        <TeamSelect id="away-team" teams={user.teams} setValue={setAway} value={away} label="Visitante"></TeamSelect>

        <Button
            disabled={!home || !away || isLoading}
            variant="contained"
            color="primary"
            onClick={playMatch}>
            Jugar partido
        </Button>
        {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}

        <h2>Partidos jugados</h2>
        <MatchesTable matches={matches}></MatchesTable>
    </Layout>
}

export async function getServerSideProps({req, res}) {
    const session = await getSession(req);

    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    let matches = await findMatches(session.id);
    // Hack
    matches = JSON.parse(JSON.stringify(matches));

    return {
        props: {
            user,
            matches
        }
    };
}
