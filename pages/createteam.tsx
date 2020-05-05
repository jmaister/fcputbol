
import Router from 'next/router';

import { useState } from 'react';

import { useUser } from '../lib/hooks';
import Layout from '../components/layout';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import {Team} from '../db/entity/team.entity';
import JerseySelect from 'components/team/JerseySelect';

export default function CreateTeam({}) {
    const user = useUser();
    const [errorMsg, setErrorMsg] = useState('');

    const team = {
        name: "",
        jersey_color: "",
    } as Team;

    return (
        <Layout>
            <h1>Equipo</h1>

            {user && <p>Currently logged in as: {JSON.stringify(user)}</p>}

            {<p>value: {JSON.stringify(team)}</p>}

            <Formik
                initialValues={team}
                validationSchema={Yup.object({
                    name: Yup.string().min(5).max(15).required(),
                    jersey_color: Yup.string().required(),
                })}
                onSubmit={async (values, actions) => {
                    console.log("onsubmit values", values);
                    fetch('/api/teams', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(values),
                    })
                        .then((response) => response.json())
                        .then(data => {
                            console.log("fetch response data", data);
                            actions.setSubmitting(false);
                            if (data.ok) {
                                setErrorMsg(null);
                                Router.push('/teams');
                            } else {
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
                        <div>{JSON.stringify(errors)}</div>
                        <Field
                            component={TextField}
                            id="name"
                            name="name"
                            label="Nombre"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            helperText={errors.name}
                            error={!!errors.name}
                        ></Field>
                        <br />
                        <Field
                            component={JerseySelect}
                            id="jersey_color"
                            name="jersey_color"
                            label="Equipación"
                            value={values.jersey_color}
                            onChange={handleChange}
                            helperText={errors.name}
                            error={!!errors.name}
                        ></Field>

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
