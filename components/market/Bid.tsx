import { useState } from "react";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from 'yup';

import { TextField, Button } from "@material-ui/core";
import Loading from "components/Loading";
import Router from "next/router";

interface BidProps {
    startingPrice: number
    marketPlayerId: number
    leagueId: number
}

export default function Bid({ startingPrice, marketPlayerId, leagueId }: BidProps) {
    const [errorMsg, setErrorMsg] = useState('');

    const minPrice = startingPrice;
    const currentUserAvailable = 999999999; //TODO: calculate user available money
    const initial = {
        bidPrice: minPrice,
        marketPlayerId,
    };

    const onSubmit = async (values, actions) => {
        console.log("submit", values);
        fetch('/api/sendbid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })
        .then((response) => response.json())
        .then(response => {
            console.log("fetch response data", response);
            if (response.ok) {
                setErrorMsg(null);
                Router.push('/league/' + leagueId + '/market');
            } else {
                setErrorMsg(JSON.stringify(response.message));
                actions.resetForm({
                    bidPrice: response.minBid,
                    marketPlayerId,
                });
            }
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
            {props => {
                return <Form>
                    <Field
                        as={TextField}
                        name="bidPrice"
                        label="Puja"
                        required={true}
                        fullWidth
                        helperText={<ErrorMessage name="bidPrice" />}
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={!props.isValid || props.isSubmitting}
                    >Pujar</Button>
                    <Loading isLoading={props.isSubmitting}/>
                </Form>
            }}
        </Formik>
    </>
}
