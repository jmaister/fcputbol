
import { useState } from 'react'

import Layout from 'components/layout';

import { League, LeagueStatus } from 'db/entity/league.entity';
import TeamName from 'components/team/TeamName';
import { findLeague } from 'lib/LeagueService';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import { User } from 'db/entity/user.entity';
import Router from 'next/router'
import { getSession } from 'lib/iron';
import { findUser } from 'lib/UserService';
import LeagueStatusChip from 'components/league/LeagueStatusChip';
import MatchesTable from 'components/match/MatchesTable';

interface LeaguePageParams {
    league: League
    user: User
}

export default function LeaguePage({league, user}: LeaguePageParams) {
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isAdmin = league.admin.id === user.id;

    const isOrganizing = league.status === LeagueStatus.ORGANIZING;
    const isOngoing = league.status === LeagueStatus.ONGOING;
    const isFinished = league.status === LeagueStatus.FINISHED;

    const startLeague = async () => {
        setIsLoading(true);

        const body = {
            leagueId: league.id
        };
        try {
            const res = await fetch('/api/startleague', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.status === 200) {
                const response = await res.json();
                console.log("response", response);
                Router.push('/league/' + league.id);
            } else {
                setIsLoading(false);
                const text = await res.text();
                setErrorMsg(text);
                throw new Error(text)
            }
        } catch (error) {
            setIsLoading(false);
            console.error('An unexpected error happened occurred:', error);
            setErrorMsg(error.message);
        }
    };

    return (
        <Layout>
            <h1>Liga: <b>{league.name}</b></h1>

            <p>Administrador: @{league.admin.username}</p>
            <div>Estado: <LeagueStatusChip status={league.status} /></div>


            {isAdmin && isOrganizing ?
            <Button
                variant="contained"
                color="primary"
                disabled={isLoading}
                onClick={() => startLeague()}>
                Comenzar liga
            </Button>
            :null}

            {isOrganizing ? <p>Envía este código para entrar en la liga: <a href={'/enterleague/'+ league.code}>{league.code}</a>
                </p>: null}
            {isOngoing ? <p>La liga ya está en marcha. No se pueden añadir más jugadores.</p> : null}
            {isFinished ? <p>La liga ya ha finalizado.</p> : null}

            <h2>Equipos participando</h2>
            <List>
            {league.teams.map(t => (
                <ListItem key={t.id}>
                    <TeamName team={t} />
                </ListItem>
            ))}
            </List>

            {isOngoing || isFinished ?
            <>
                <h2>Partidos</h2>
                <MatchesTable matches={league.matches} />
            </>
            : null}
        </Layout>
    )
}


export async function getServerSideProps(context) {
    const leagueId = context.params.id;
    let league = await findLeague(leagueId);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    // Sort matches
    league.matches.sort((a, b) => {
        return a.round - b.round;
    });

    const session = await getSession(context.req);
    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    console.log("league", league);

    return {
        props: {
            user,
            league
        }
    };
}
