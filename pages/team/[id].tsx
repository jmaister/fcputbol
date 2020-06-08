
import { useState } from 'react'

import Layout from 'components/layout';
import PlayersTable from 'components/player/PlayersTable';

import { findTeam } from 'lib/TeamService';

import { Team } from 'db/entity/team.entity';
import { League } from 'db/entity/league.entity';

import { getSession } from 'lib/iron';
import TeamName from 'components/team/TeamName';
import { findLeague } from 'lib/LeagueService';
import { getUserAssets, UserAssetInfo } from 'lib/UserService';
import { UserAssetType } from 'db/entity/user.entity';

interface TeamPageParams {
    league: League
    userId: number
    team: Team
    userAssets: UserAssetInfo
}

export default function TeamPage({league, team, userId, userAssets}: TeamPageParams) {
    const [errorMsg, setErrorMsg] = useState('');

    const canEdit = team.user.id === userId;

    return (
        <Layout>
            <h1>Equipo: <b>{team.name}</b></h1>

            <TeamName team={team}></TeamName>

            <p>Puntos disponibles <b>{userAssets.amount}</b>.</p>

            <PlayersTable league={league} team={team} players={team.players} lineup={team.currentLineup} isEditable={canEdit} />
        </Layout>
    )
}


export async function getServerSideProps(context) {
    // TODO: check valid user
    const session = await getSession(context.req);
    const userId = session.id;

    const teamId = context.params.id;
    let team = await findTeam(teamId);
    // Hack
    team = JSON.parse(JSON.stringify(team));

    // TODO: get league id
    let league = await findLeague(1);
    // Hack
    league = JSON.parse(JSON.stringify(league));

    const userAssets = await getUserAssets(userId, league.id, UserAssetType.PLAYER_POINTS);

    return {
        props: {
            team,
            userId,
            league,
            userAssets,
        }
    };
}
