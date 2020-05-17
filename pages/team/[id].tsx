
import { useState } from 'react'

import Layout from 'components/layout';
import PlayersTable from 'components/player/PlayersTable';

import { findTeam } from 'lib/TeamService';

import { Team } from 'db/entity/team.entity';
import { User } from 'db/entity/user.entity';
import { getSession } from 'lib/iron';
import TeamName from 'components/team/TeamName';
import { findUser } from 'lib/UserService';

interface TeamPageParams {
    userId: number
    team: Team
}

export default function TeamPage({team, userId}: TeamPageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const canEdit = team.user.id === userId;

    return (
        <Layout>
            <h1>Equipo: <b>{team.name}</b></h1>

            <TeamName team={team}></TeamName>

            <PlayersTable team={team} players={team.players} lineup={team.currentLineup} isEditable={canEdit} />
        </Layout>
    )
}


export async function getServerSideProps(context) {
    const session = await getSession(context.req);
    const userId = session.id;

    const teamId = context.params.id;
    let team = await findTeam(teamId);
    // Hack
    team = JSON.parse(JSON.stringify(team));

    return {
        props: {
            team,
            userId,
        }
    };
}
