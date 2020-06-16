import { createUser } from 'lib/UserService';
import { createTeam } from 'lib/TeamService';
import { jerseyColors } from 'lib/teamUtils';
import { createLeague, enterLeague } from 'lib/LeagueService';
import { createSeason } from 'lib/SeasonService';

export default async function setup(req, res) {

    if (req.method === 'GET') {
        try {
            const user1 = await createUser({username: 'jordi', password: 'burgos'});
            const user2 = await createUser({username: 'john', password: 'john'});

            const team1 = await createTeam({name: "Equipo Total", jersey_color: jerseyColors[0].value, userId: 1});
            const team2 = await createTeam({name: "Equipo Menor", jersey_color: jerseyColors[5].value, userId: 2});

            const league = await createLeague({name: 'Liga Mundial', yourteam: team1.id, userId: 1});
            await enterLeague({yourteam: team2.id, code: league.code, userId: 2});

            await createSeason({name: "Temporada 1", leagueId: league.id, userId: 1});

            res.status(200).json({ ok: true, data: { user1, user2 } });
        } catch (error) {
            console.log("startseason error", error);
            res.status(400).json({ ok: false, error: error });
        };
    } else {
        res.status(405);
    }

}
