import { useState } from "react";

import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from 'yup';

import { TextField, Button, Typography } from "@material-ui/core";
import Loading from "components/Loading";
import Router from "next/router";

interface BidProps {
    startingPrice: number
    marketPlayerId: number
    leagueId: number
}

interface BidFormProps {
    bidPrice: number
    marketPlayerId: number
}

export default function Bid({ startingPrice, marketPlayerId, leagueId }: BidProps) {
    const [errorMsg, setErrorMsg] = useState('');

    const minPrice = startingPrice;
    const currentUserAvailable = 999999999; //TODO: calculate user available money
    const initial:BidFormProps = {
        bidPrice: minPrice,
        marketPlayerId,
    };

    const onSubmit = async (values, actions:FormikHelpers<BidFormProps>) => {
        setErrorMsg(null);
        return fetch('/api/sendbid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            .then((response) => response.json())
            .then(response => {
                console.log("fetch response data", response);
                if (response.ok) {
                    Router.push('/league/' + leagueId + '/market');
                } else {
                    setErrorMsg(response.message);
                    actions.setSubmitting(false);
                    if (response.minBid) {
                        actions.setFieldValue('bidPrice', response.minBid);
                    }
                }
            }).catch(error => {
                setErrorMsg(error);
                actions.setSubmitting(false);
            });
    }

    return <>
        <Formik
            initialValues={initial}
            onSubmit={onSubmit}
            validationSchema={Yup.object({
                bidPrice: Yup.number().integer().min(minPrice).max(currentUserAvailable).required().label("Puja"),
            })}
            >
            {({isValid, isSubmitting, errors}) => {
                return <Form>
                    <Field
                        as={TextField}
                        name="bidPrice"
                        label="Puja"
                        required={true}
                        fullWidth
                        helperText={errors.bidPrice}
                        caca={<ErrorMessage name="bidPrice" />}
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={!isValid || isSubmitting}
                    >Pujar</Button>
                    {errorMsg && <Typography color="error"><p>{errorMsg}</p></Typography>}
                    <Loading isLoading={isSubmitting}/>
                </Form>
            }}
        </Formik>
    </>
}
