import '../styles/main.scss';
import '../styles/stadium.scss';

import Head from 'next/head';
import Header from 'components/header';
import Container from '@material-ui/core/Container';

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>FC Pútbol</title>
            </Head>
            <Header />

            <Container>
                <Component {...pageProps} />
            </Container>
        </>
    );
}
