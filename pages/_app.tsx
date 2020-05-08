import '../styles/main.scss';
import '../styles/stadium.scss';
import '../styles/jerseys.scss';
import '../styles/labels.scss';

import Head from 'next/head';
import Header from 'components/header';
import Container from '@material-ui/core/Container';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { green } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: green,
    },
});

export default function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>FC Pútbol</title>
            </Head>
            <Header />

            <Container>
                <Component {...pageProps} />
            </Container>
        </ThemeProvider>
    );
}
