
import { useState } from 'react'
import Router from 'next/router'

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { League, LeagueStatus } from 'db/entity/league.entity';
import { User } from 'db/entity/user.entity';

import Layout from 'components/layout';
import TeamName from 'components/team/TeamName';
import ClassificationTable from 'components/league/ClassificationTable';
import LeagueStatusChip from 'components/league/LeagueStatusChip';
import MatchesTable from 'components/match/MatchesTable';

import { findLeague } from 'lib/LeagueService';
import { getSession } from 'lib/iron';
import { findUser } from 'lib/UserService';
import { withAuthSSP } from 'lib/withAuth';

interface LeaguePageParams {
    league: League
    user: User
}

export default function LeaguePage({league, user}: LeaguePageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const isAdmin = league.admin.id === user.id;

    const isOrganizing = league.status === LeagueStatus.ORGANIZING;
    const isOngoing = league.status === LeagueStatus.ONGOING;
    const isFinished = league.status === LeagueStatus.FINISHED;

    const formValues = {
        leagueId: league.id,
        name: ''
    };

    return (
        <Layout>
            <h1>Liga: <b>{league.name}</b></h1>

            <p>Administrador: @{league.admin.username}</p>
            <div>Estado: <LeagueStatusChip status={league.status} /></div>

            {isAdmin && isOrganizing ? <>

                <Formik
                initialValues={formValues}
                validationSchema={Yup.object({
                    name: Yup.string().min(5).max(30).required().label("Nombre"),
                })}
                onSubmit={async (values, actions) => {
                    console.log("onsubmit values", values);
                    fetch('/api/startseason', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(values),
                    })
                    .then((response) => response.json())
                    .then(response => {
                        console.log("fetch response data", response);
                        if (response.ok) {
                            setErrorMsg(null);
                            Router.push('/league/' + response.data.id);
                        } else {
                            actions.setSubmitting(false);
                            setErrorMsg(JSON.stringify(response.error.message));
                        }
                    });
                    // TODO: catch
                }}
                >{({
                    values,
                    handleSubmit,
                    isSubmitting,
                    isValid,
                    handleChange,
                    handleBlur,
                    errors
                }) => (
                    <form onSubmit={handleSubmit} method="POST">
                        <Field
                            component={TextField}
                            id="name"
                            name="name"
                            label="Nombre de la temporada"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            helperText={errors.name}
                            error={!!errors.name}
                        ></Field>
                        <br />
                        {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || !isValid}>
                            Comenzar una nueva temporada
                        </Button>
                    </form>
                )}
            </Formik>
            </>:null}

            {isOrganizing ? <p>Envía este código para entrar en la liga: <a href={'/enterleague/'+ league.code}>{league.code}</a>
                </p>: null}
            {isOngoing ? <p>La liga ya está en marcha. No se pueden añadir más jugadores.</p> : null}
            {isFinished ? <p>La liga ya ha finalizado.</p> : null}

            {isOrganizing ?
            <>
                <h2>Equipos participando</h2>
                <List>
                {league.teams.map(t => (
                    <ListItem key={t.id}>
                        <TeamName team={t} />
                    </ListItem>
                ))}
                </List>
                </>
            : null}

            {isOngoing || isFinished ?
            <>
                <h2>Clasificación</h2>
                <ClassificationTable classifications={league.currentSeason.classifications} />

                <h2>Partidos //TODO: add pagination for rounds</h2>
                <MatchesTable matches={league.currentSeason.rounds[league.currentSeason.currentRound].matches} />
            </>
            : null}

        </Layout>
    )
}


export const getServerSideProps = withAuthSSP(async (context) => {
    const leagueId = context.params.id;
    console.log("found league id", leagueId);
    let league = await findLeague(leagueId);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    console.log("found league", league);

    // Sort rounds
    if (league.currentSeason && league.currentSeason.rounds) {
        league.currentSeason.rounds.sort((a, b) => {
            const df = a.roundNumber - b.roundNumber;
            if (df === 0) {
                return a.id - b.id;
            }
            return df;
        });
    }

    const session = await getSession(context.req);
    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    return {
        props: {
            user,
            league
        }
    };
});
