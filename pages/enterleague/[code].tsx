
import Router from 'next/router';

import { useState } from 'react';

import Layout from 'components/layout';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';


import { TextField } from 'formik-material-ui';

import { User } from 'db/entity/user.entity';
import TeamName from 'components/team/TeamName';
import { getSession } from 'lib/iron';
import { findUser } from 'lib/UserService';
import { withAuthSSP } from 'lib/withAuth';
import { League } from 'db/entity/league.entity';
import { findLeagueByCode } from 'lib/LeagueService';
import { List, ListItem } from '@material-ui/core';

interface CreateLeagueParams {
    user?: User
    league: League
}

export default function EnterLeague({user, league}:CreateLeagueParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const enterleague = {
        yourteam: "",
        code: league.code
    };

    const isAlreadyInLeague = league.teams.filter(team => team.user.id == user.id).length > 0;

    return (
        <Layout>
            <h1>Entrar en esta liga</h1>

            <p>Administrador: @{league.admin.username}</p>

            <p>Envía este código para entrar en la liga: <a href={'/enterleague/'+ league.code}>{league.code}</a></p>

            <h2>Equipos participando</h2>
            <List>
            {league.teams.map(t => (
                <ListItem key={t.id}>
                    <TeamName team={t} />
                </ListItem>
            ))}
            </List>

            {isAlreadyInLeague
            ? <p>Ya estás en esta liga</p>
            :

            <div>
                <h2>Rellena el formulario</h2>
                <Formik
                    initialValues={enterleague}
                    validationSchema={Yup.object({
                        yourteam: Yup.string().required(),
                    })}
                    onSubmit={async (values, actions) => {
                        console.log("onsubmit values", values);
                        return fetch('/api/enterleague', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(values),
                            })
                            .then((response) => response.json())
                            .then(data => {
                                console.log("fetch response data", data);
                                if (data.ok) {
                                    setErrorMsg(null);
                                    Router.push('/league/' + league.id);
                                } else {
                                    actions.setSubmitting(false);
                                    setErrorMsg(JSON.stringify(data.error.message));
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
                                type="text"
                                name="yourteam"
                                label="Tu equipo"
                                select
                                variant="standard"
                                helperText="Selecciona tu equipo para esta liga"
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={!!errors.yourteam}
                            >
                                {user.teams.map(option => (
                                <MenuItem key={option.id} value={option.id}>
                                    <TeamName team={option} isLink={false} />
                                </MenuItem>
                                ))}
                            </Field>
                            <br />

                            {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting || !isValid}>
                                Guardar
                            </Button>
                        </form>
                    )}
                </Formik>
            </div>

            }

        </Layout>
    )
}

export const getServerSideProps = withAuthSSP(async (context) => {
    const session = await getSession(context.req);
    console.log("************************** session", session);

    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    let league = await findLeagueByCode(context.params.code);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    return {
        props: {
            user,
            league
        }
    };
});
