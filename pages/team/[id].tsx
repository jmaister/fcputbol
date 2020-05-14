
import { useState } from 'react'

import Layout from '../../components/layout';

import { findTeam } from '../../lib/TeamService';

import PlayersTable from '../../components/player/PlayersTable';

import {Team} from '../../db/entity/team.entity';

interface TeamPageParams {
    team: Team
}

export default function TeamPage({team}: TeamPageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    return (
        <Layout>
            <h1>Equipo: <b>{team.name}</b></h1>

            <PlayersTable team={team} players={team.players} lineup={team.currentLineup}></PlayersTable>
        </Layout>
    )
}


export async function getServerSideProps(context) {
    const teamId = context.params.id;
    let team = await findTeam(teamId);
    // Hack
    team = JSON.parse(JSON.stringify(team));
    console.log("team found", team);

    return {
        props: {
            team
        }
    };
}
