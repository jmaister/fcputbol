import { User } from "db/entity/user.entity";
import { Team } from "db/entity/team.entity";
import { createUser } from "lib/UserService";
import { createTeam } from "lib/TeamService";
import { jerseyColors } from "lib/teamUtils";
import { League } from "db/entity/league.entity";
import { createLeague, enterLeague } from "lib/LeagueService";
import { Season } from "db/entity/season.entity";
import { createSeason } from "lib/SeasonService";


export function createRandomUsername() {
    return "test" + Math.floor(Math.random() * 1000000);
}

export interface UserAndTeam {
    user: User
    team: Team
}
export async function createUserAndTeam(): Promise<UserAndTeam> {
    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();

    const team:Team = await createTeam({
        name: 'Team ' + Math.random(),
        userId: user.id,
        jersey_color: jerseyColors[0].value,
    });
    expect(team).not.toBeNull();

    return {
        user,
        team,
    }
}

export interface MinimalLeague {
    u1: User
    t1: Team
    u2: User
    t2: Team
    league: League
    users: User[]
    teams: Team[]
}

export async function createMinimalLeague(teamCount:number=2): Promise<MinimalLeague> {
    const users:User[] = [];
    const teams:Team[] = [];

    const u1 = await createUserAndTeam();
    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });

    users.push(u1.user);
    teams.push(u1.team);

    for (let i=0; i<teamCount-1; i++) {
        const next = await createUserAndTeam();
        const enteredLeague = await enterLeague({
            yourteam: next.team.id,
            userId: next.user.id,
            code: league.code,
        });
        users.push(next.user);
        teams.push(next.team);
    }

    return {
        u1: u1.user,
        t1: u1.team,
        u2: users[1],
        t2: teams[1],
        league: league,
        users,
        teams,
    }
}

export interface LeagueAndSeason extends MinimalLeague {
    season: Season
}

export async function createLeagueAndSeason(teamCount:number=2): Promise<LeagueAndSeason> {
    const context = await createMinimalLeague(teamCount);

    const season = await createSeason({
        name: "Season " + Math.random(),
        leagueId: context.league.id,
        userId: context.u1.id
    });

    return {
        ...context,
        season: season
    };
}
