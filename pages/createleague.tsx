
import Router from 'next/router';

import { useState } from 'react';

import Layout from '../components/layout';

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

interface CreateLeaguePageParams {
    user: User
}

export default function CreateLeague({user}:CreateLeaguePageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const league = {
        name: "",
        yourteam: "",
    };

    return (
        <Layout>
            <h1>Crear una nueva liga</h1>

             <Formik
                initialValues={league}
                validationSchema={Yup.object({
                    name: Yup.string().min(5).max(15).required().label("Nombre"),
                    yourteam: Yup.string().required(),
                })}
                onSubmit={async (values, actions) => {
                    console.log("onsubmit values", values);
                    fetch('/api/leagues', {
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
                            label="Nombre de la liga"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            helperText={errors.name}
                            error={!!errors.name}
                        ></Field>
                        <br />
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

        </Layout>
    )
}

export const getServerSideProps = withAuthSSP(async ({req, res}) => {
    const session = await getSession(req);
    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    return {
        props: {
            user,
        }
    };
});
