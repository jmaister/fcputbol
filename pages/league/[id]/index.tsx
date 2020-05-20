
import { useState } from 'react'
import Router from 'next/router'
import moment from 'moment';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';

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
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Link from 'next/link';

interface LeaguePageParams {
    league: League
    user: User
}

export default function LeaguePage({league, user}: LeaguePageParams) {
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedSeason, setSelectedSeason] = useState(league.seasons ? league.seasons.length-1 : -1);
    const [selectedRound, setSelectedRound] = useState(league.currentSeason ? league.currentSeason.currentRound : 0);

    // TODO: get locale from user
    moment.locale("es");

    const isAdmin = league.admin.id === user.id;

    const isOrganizing = league.status === LeagueStatus.ORGANIZING;
    const isOngoing = league.status === LeagueStatus.ONGOING;
    const isFinished = league.status === LeagueStatus.FINISHED;

    // TODO: move to common business functions
    const canStartSeason = isAdmin && isOrganizing && league.teams.length > 1;

    const showSeasonClassification = league.seasons && league.seasons.length > 0;
    let seasonToShow = null;
    if (showSeasonClassification) {
        seasonToShow = league.seasons[selectedSeason];
    }

    const formValues = {
        leagueId: league.id,
        name: ''
    };
    const handleRoundChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSelectedRound(value-1);
    };

    const onSeasonChange = (event: React.ChangeEvent<{ value: number }>) => {
        setSelectedSeason(event.target.value);
    };

    return (
        <Layout>
            <h1>Liga: <b>{league.name}</b></h1>

            <p>Administrador: @{league.admin.username}</p>
            <div>Estado: <LeagueStatusChip status={league.status} /></div>

            <Link href={'/league/' + league.id + '/market'}>
                <Button color="primary" variant="contained">Subasta de jugadores</Button>
            </Link>

            {canStartSeason ? <>

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
                            Router.push('/league/' + league.id);
                        } else {
                            actions.setSubmitting(false);
                            setErrorMsg(JSON.stringify(response.error.message));
                        }
                    });
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

                {isOrganizing ? <p>Envía este código para entrar en la liga: <a href={'/enterleague/'+ league.code}>{process.env.NEXT_PUBLIC_SERVER_URL}/enterleague/{league.code}</a>
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

            {showSeasonClassification ?
            <>
                <FormControl>
                    <InputLabel id="season-label-id">Temporada</InputLabel>
                    <Select
                        labelId="season-label-id"
                        id="season-select"
                        value={selectedSeason}
                        onChange={onSeasonChange}
                        >
                        {league.seasons.map((s, i) => <MenuItem key={s.id} value={i}>{s.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <h2>Clasificación: {seasonToShow.status}</h2>
                <ClassificationTable classifications={seasonToShow.classifications} />

                <p>
                    Estamos en la jornada <b>{seasonToShow.currentRound+1}</b> de <b>{seasonToShow.roundCount}</b>.
                </p>
                <h2>Partidos</h2>
                <div>
                    Jornadas:
                    <Pagination count={seasonToShow.roundCount} page={selectedRound+1} onChange={handleRoundChange} color="primary" />
                </div>
                {selectedRound >= seasonToShow.currentRound ?
                <p>
                    Las alineaciones para la jornada <b>{selectedRound+1}</b> se bloquearán <b>{moment(seasonToShow.rounds[selectedRound].freezeLineupDate).calendar()}</b>
                </p>
                :
                <p>
                    La jornada <b>{selectedRound+1}</b> terminó <b>{moment(seasonToShow.rounds[selectedRound].finishDate).calendar()}</b>
                </p>
                }
                <MatchesTable matches={seasonToShow.rounds[selectedRound].matches} />
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

    // TODO: sort seasons

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
