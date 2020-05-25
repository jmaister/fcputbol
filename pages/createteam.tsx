
import Router from 'next/router';

import { useState } from 'react';

import Layout from '../components/layout';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';


import { TextField } from 'formik-material-ui';

import {Team} from 'db/entity/team.entity';
import Loading from 'components/Loading';
import { jerseyColors } from 'lib/teamUtils';

export default function CreateTeam({}) {
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const team = {
        name: "",
        jersey_color: "",
    } as Team;

    return (
        <Layout>
            <h1>Equipo</h1>

            <Formik
                initialValues={team}
                validationSchema={Yup.object({
                    name: Yup.string().min(5).max(15).required(),
                    jersey_color: Yup.string().required(),
                })}
                onSubmit={async (values, actions) => {
                    console.log("onsubmit values", values);
                    setIsLoading(true);
                    return fetch('/api/teams', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(values),
                        })
                        .then((response) => response.json())
                        .then(response => {
                            console.log("fetch response data", response);
                            if (response.ok) {
                                setErrorMsg(null);
                                Router.push('/teams');
                            } else {
                                actions.setSubmitting(false);
                                setErrorMsg(JSON.stringify(response.error));
                            }
                            setIsLoading(false);
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
                            label="Nombre"
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
                            name="jersey_color"
                            label="Color"
                            select
                            variant="standard"
                            helperText="Selecciona el color del equipo"
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        >
                            {jerseyColors.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                <span className={"jersey-sample jersey-" + option.value}>{option.label}</span>
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
            <Loading isLoading={isLoading} />
        </Layout>
    )
}
