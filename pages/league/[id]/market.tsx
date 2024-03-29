import Link from 'next/link';

import { useState } from 'react'

import Layout from 'components/layout';

import { findUser, getUserMoney, UserMoneyInfo } from 'lib/UserService';

import { Button, List, ListItem } from '@material-ui/core';

import { User } from 'db/entity/user.entity';
import { League } from 'db/entity/league.entity';
import { MarketPlayer } from 'db/entity/marketplayer.entity';
import MarketTable from 'components/market/MarketTable';
import { getSession } from 'lib/iron';
import { findLeague } from 'lib/LeagueService';
import { findAvailableMarketPlayers } from 'lib/MarketService';
import { withAuthSSP } from 'lib/withAuth';


interface MarketPageParams {
    user: User
    league: League
    marketPlayers: MarketPlayer[]
    userMoneyInfo: UserMoneyInfo
}


export default function MarketPage({ user, league, marketPlayers, userMoneyInfo }: MarketPageParams) {
    const [errorMsg, setErrorMsg] = useState('');
    // TODO: use users config
    const NF = new Intl.NumberFormat("es-ES");

    return <Layout>
        <Link href={'/league/' + league.id}>
            <Button color="primary" variant="contained">Volver</Button>
        </Link>

        <h1>Subasta de jugadores</h1>

        <p>Tienes <b>{NF.format(userMoneyInfo.money)} €</b> y puedes llegar a gastar hasta <b>{NF.format(userMoneyInfo.expendable)} €</b>.</p>
        <p>Dinero bloqueado en pujas <b>{NF.format(userMoneyInfo.blocked)} €</b></p>

        <MarketTable marketPlayers={marketPlayers} leagueId={league.id} userMoneyInfo={userMoneyInfo} />
    </Layout>
}

export const getServerSideProps = withAuthSSP(async (context) => {
    const session = await getSession(context.req);
    const leagueId = context.params.id;

    let user = await findUser(session.id);
    // Hack
    user = JSON.parse(JSON.stringify(user));

    // User leagues
    let league = await findLeague(leagueId);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    let marketPlayers = await findAvailableMarketPlayers(leagueId);
    // Hack
    marketPlayers = JSON.parse(JSON.stringify(marketPlayers));

    let userMoneyInfo = await getUserMoney(user.id, leagueId)

    return {
        props: {
            user,
            league,
            marketPlayers,
            userMoneyInfo,
        }
    };
});
