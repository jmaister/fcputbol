import '../styles/main.scss';
import '../styles/labels.scss';
import '../styles/stadium.scss';

import Head from 'next/head';
import Header from 'components/header';
import { Container, ThemeProvider } from '@material-ui/core';
import theme from '../components/theme';

import moment from 'moment';

export default function MyApp({ Component, pageProps }) {
    // TODO: get locale from user
    moment.locale("es");

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>FC Pútbol</title>
            </Head>
            <Header />

            <Container className="app-container">
                <Component {...pageProps} />
            </Container>

        </ThemeProvider>
    );
}
