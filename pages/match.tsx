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
    const [isLoading, setIsloading] = useState(false);

    const playMatch = async () => {
        setIsloading(true);

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
                setIsloading(false);
                throw new Error(await res.text())
            }
        } catch (error) {
            setIsloading(false);
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
    console.log("SESSION", session);

    let user = await findUser(session.id);
    // let user = { "id": 1, "username": "jordi", "password": "bf0d87d4da3f4679ad0aea96a2771e46575c537e71bc0963b7c15c858ef89bcf151a1c578297a72b5a186c32043126d5f78913ff0a184d68f5c6d4679016a0be", "teams": [{ "id": 15, "name": "equipo24", "players": [{ "id": 7, "name": "Alex", "surname": "Alvarenga", "num": 11, "position": "mid", "save": 28, "defense": 20, "pass": 30, "dribble": 20, "shot": 24 }, { "id": 6, "name": "Alfonso", "surname": "Cáceres", "num": 4, "position": "def", "save": 21, "defense": 23, "pass": 23, "dribble": 24, "shot": 25 }, { "id": 8, "name": "Francisco", "surname": "Tristán", "num": 12, "position": "mid", "save": 30, "defense": 27, "pass": 21, "dribble": 22, "shot": 24 }, { "id": 17, "name": "Gabriel", "surname": "Olaverri", "num": 10, "position": "mid", "save": 24, "defense": 26, "pass": 27, "dribble": 25, "shot": 24 }, { "id": 13, "name": "Guillermo", "surname": "Montalbán", "num": 17, "position": "fw", "save": 24, "defense": 22, "pass": 22, "dribble": 29, "shot": 20 }, { "id": 15, "name": "Héctor", "surname": "De Ona", "num": 5, "position": "def", "save": 26, "defense": 25, "pass": 26, "dribble": 27, "shot": 25 }, { "id": 3, "name": "Ignacio", "surname": "Merino", "num": 7, "position": "def", "save": 30, "defense": 26, "pass": 26, "dribble": 30, "shot": 23 }, { "id": 11, "name": "Iker", "surname": "Velázquez", "num": 15, "position": "fw", "save": 21, "defense": 28, "pass": 22, "dribble": 23, "shot": 25 }, { "id": 10, "name": "José", "surname": "Orama", "num": 14, "position": "fw", "save": 27, "defense": 27, "pass": 29, "dribble": 30, "shot": 24 }, { "id": 16, "name": "José Antonio", "surname": "Bogarín", "num": 2, "position": "gk", "save": 24, "defense": 20, "pass": 20, "dribble": 25, "shot": 28 }, { "id": 12, "name": "José María", "surname": "Zalazar", "num": 16, "position": "fw", "save": 26, "defense": 25, "pass": 27, "dribble": 27, "shot": 24 }, { "id": 14, "name": "Juan Antonio", "surname": "Villeda", "num": 18, "position": "fw", "save": 25, "defense": 20, "pass": 25, "dribble": 21, "shot": 29 }, { "id": 5, "name": "Juan Carlos", "surname": "Cruz", "num": 9, "position": "mid", "save": 29, "defense": 23, "pass": 27, "dribble": 27, "shot": 27 }, { "id": 1, "name": "Mario", "surname": "Loáisiga", "num": 3, "position": "gk", "save": 30, "defense": 26, "pass": 29, "dribble": 26, "shot": 22 }, { "id": 18, "name": "Mohamed", "surname": "Echeverría", "num": 1, "position": "gk", "save": 30, "defense": 29, "pass": 27, "dribble": 25, "shot": 29 }, { "id": 9, "name": "Raúl", "surname": "Aldecoba", "num": 13, "position": "mid", "save": 23, "defense": 24, "pass": 27, "dribble": 20, "shot": 28 }, { "id": 4, "name": "Ricardo", "surname": "Tello", "num": 8, "position": "def", "save": 21, "defense": 25, "pass": 28, "dribble": 21, "shot": 29 }, { "id": 2, "name": "Tomás", "surname": "Taleno", "num": 6, "position": "def", "save": 27, "defense": 30, "pass": 27, "dribble": 20, "shot": 20 }] }, { "id": 16, "name": "equipo25", "players": [{ "id": 27, "name": "Diego", "surname": "Abugadba", "num": 12, "position": "mid", "save": 26, "defense": 28, "pass": 22, "dribble": 21, "shot": 29 }, { "id": 34, "name": "Emilio", "surname": "Saboz", "num": 4, "position": "def", "save": 23, "defense": 28, "pass": 25, "dribble": 23, "shot": 27 }, { "id": 23, "name": "Francisco", "surname": "Ibáñez", "num": 5, "position": "def", "save": 28, "defense": 29, "pass": 26, "dribble": 26, "shot": 29 }, { "id": 36, "name": "Félix", "surname": "Dormuz", "num": 1, "position": "gk", "save": 27, "defense": 22, "pass": 20, "dribble": 30, "shot": 22 }, { "id": 32, "name": "Félix", "surname": "Selles", "num": 17, "position": "fw", "save": 30, "defense": 21, "pass": 25, "dribble": 20, "shot": 30 }, { "id": 21, "name": "Gabriel", "surname": "Alcanzar", "num": 7, "position": "def", "save": 30, "defense": 29, "pass": 20, "dribble": 28, "shot": 25 }, { "id": 35, "name": "Gregorio", "surname": "Cortissoz", "num": 9, "position": "mid", "save": 23, "defense": 23, "pass": 28, "dribble": 22, "shot": 29 }, { "id": 28, "name": "Jorge", "surname": "Matamoros", "num": 13, "position": "mid", "save": 30, "defense": 25, "pass": 21, "dribble": 22, "shot": 29 }, { "id": 31, "name": "José Luis", "surname": "Ubeda", "num": 16, "position": "fw", "save": 26, "defense": 24, "pass": 20, "dribble": 21, "shot": 30 }, { "id": 30, "name": "Juan Carlos", "surname": "Tarjan", "num": 15, "position": "fw", "save": 28, "defense": 26, "pass": 27, "dribble": 22, "shot": 28 }, { "id": 24, "name": "Julio", "surname": "Adames", "num": 10, "position": "mid", "save": 26, "defense": 27, "pass": 30, "dribble": 25, "shot": 27 }, { "id": 33, "name": "Luis Miguel", "surname": "Troyo", "num": 18, "position": "fw", "save": 21, "defense": 20, "pass": 25, "dribble": 30, "shot": 30 }, { "id": 19, "name": "Marc", "surname": "Bohorguez", "num": 2, "position": "gk", "save": 23, "defense": 28, "pass": 20, "dribble": 24, "shot": 21 }, { "id": 20, "name": "Miguel", "surname": "Kaminsky", "num": 3, "position": "gk", "save": 25, "defense": 20, "pass": 26, "dribble": 26, "shot": 20 }, { "id": 22, "name": "Salvador", "surname": "Zacasa", "num": 8, "position": "def", "save": 25, "defense": 28, "pass": 21, "dribble": 25, "shot": 28 }, { "id": 29, "name": "Víctor", "surname": "Savinón", "num": 14, "position": "fw", "save": 29, "defense": 28, "pass": 29, "dribble": 25, "shot": 28 }, { "id": 25, "name": "Xavier", "surname": "Arzola", "num": 6, "position": "def", "save": 25, "defense": 20, "pass": 21, "dribble": 24, "shot": 27 }, { "id": 26, "name": "Ángel", "surname": "De Pedro", "num": 11, "position": "mid", "save": 27, "defense": 28, "pass": 22, "dribble": 23, "shot": 30 }] }] };
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
