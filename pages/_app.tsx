import '../styles/main.scss';
import '../styles/labels.scss';
import '../styles/stadium.scss';

import Head from 'next/head';
import Header from 'components/header';
import { Container, ThemeProvider } from '@material-ui/core';
import theme from '../components/theme';

export default function MyApp({ Component, pageProps }) {

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
