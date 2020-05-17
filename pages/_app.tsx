import '../styles/main.scss';
import '../styles/labels.scss';
import '../styles/stadium.scss';

import { Container, ThemeProvider } from '@material-ui/core';

import Head from 'next/head';
import Header from 'components/header';
import theme from 'components/theme';
import Footer from 'components/Footer';

export default function MyApp({ Component, pageProps }) {

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>FC Pútbol</title>
            </Head>
            <div className="app-height-adjust">
                <Header />

                <Container className="app-container">
                    <Component {...pageProps} />
                </Container>

                <Footer />
            </div>


        </ThemeProvider>
    );
}
