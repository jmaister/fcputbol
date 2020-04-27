
import { useState } from 'react'

import { useUser } from '../lib/hooks';
import Layout from '../components/layout';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Typography } from '@material-ui/core';

const Team = () => {
    const user = useUser();
    const [errorMsg, setErrorMsg] = useState('');

    const team = {
        name: ""
    };

    return (
        <Layout>
            <h1>Equipo</h1>

            {user && <p>Currently logged in as: {JSON.stringify(user)}</p>}

            <Formik
                initialValues={team}
                validationSchema={Yup.object({
                    name: Yup.string().min(5).max(15).required()
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
                            // TODO: redirect
                            setErrorMsg(null);
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
                        <br/>

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

export default Team
