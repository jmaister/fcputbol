import { useUser } from '../lib/hooks';
import Layout from '../components/layout';


export default function Home() {
    //const user = useUser();

    return (
        <Layout>
            <h1>FC Pútbol</h1>

            <p>Juego inspirado en el mítico PC Fútbol</p>

            <p>1. Crea una cuenta</p>
            <p>2. Crea una liga o consigue el código para entrar en una</p>
            <p>3. ¡¡ Jugar !!</p>

        </Layout>
    )
}
