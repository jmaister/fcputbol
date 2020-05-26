import { User } from "db/entity/user.entity";
import { Team } from "db/entity/team.entity";
import { createUser } from "lib/UserService";
import { createTeam } from "lib/TeamService";
import { jerseyColors } from "lib/teamUtils";
import { League } from "db/entity/league.entity";
import { createLeague, enterLeague } from "lib/LeagueService";



export function createRandomUsername() {
    return "test" + Math.floor(Math.random() * 100000);
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

    const team:Team = await createTeam({
        name: 'Team One',
        userId: user.id,
        jersey_color: jerseyColors[0].value,
    });
    expect(user).not.toBeNull();

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
}

export async function createMinimalLeague(): Promise<MinimalLeague> {
    const u1 = await createUserAndTeam();
    const u2 = await createUserAndTeam();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });

    const enteredLeague = await enterLeague({
        yourteam: u2.team.id,
        userId: u2.user.id,
        code: league.code,
    });

    return {
        u1: u1.user,
        t1: u1.team,
        u2: u2.user,
        t2: u2.team,
        league: enteredLeague,
    }
}
