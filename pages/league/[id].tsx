
import { useState } from 'react'

import Layout from '../../components/layout';

import { League } from 'db/entity/league.entity';
import TeamName from 'components/team/TeamName';
import { findLeague } from 'lib/LeagueService';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

interface TeamPageParams {
    league: League
}

export default function LeaguePage({league}: TeamPageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <Layout>
            <h1>Liga: <b>{league.name}</b></h1>

            <p>Administrador: @{league.admin.username}</p>

            <h2>Equipos participando</h2>
            <List>
            {league.teams.map(t => (
                <ListItem key={t.id}>
                    <TeamName team={t} />
                </ListItem>
            ))}
            </List>
        </Layout>
    )
}


export async function getServerSideProps(context) {
    const leagueId = context.params.id;
    let league = await findLeague(leagueId);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    console.log("league", league);

    return {
        props: {
            league
        }
    };
}
