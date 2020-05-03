import { useState } from 'react'
import Router from 'next/router'
import { useUser } from '../lib/hooks'
import Layout from '../components/layout'
import Form from '../components/form'

import { removeTokenCookie } from '../lib/auth-cookies'

export default function Logout({ res }) {
    // useUser({ redirectTo: '/', redirectIfFound: true })

    //Router.push('/');

    return null;
}

export async function getServerSideProps({ req, res }) {
    removeTokenCookie(res);
    res.writeHead(302, { Location: '/' });
    res.end();

    return {
        props: {
        }
    };
}

