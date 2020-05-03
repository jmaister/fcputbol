import { useUser } from '../lib/hooks'
import Layout from '../components/layout'

const Home = () => {
    const user = useUser()

    return (
        <Layout>
            <h1>FC Púlbol</h1>

            <p>Juego inspirado en el mítico PC Fútbol</p>

        </Layout>
    )
}

export default Home
