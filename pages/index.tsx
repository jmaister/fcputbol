import { useUser } from '../lib/hooks';
import Layout from '../components/layout';


export default function Home() {
    //const user = useUser();

    return (
        <Layout>
            <h1>FC Pútbol</h1>

            <p>Juego inspirado en el mítico PC Fútbol</p>

        </Layout>
    )
}
