import { User } from "db/entity/user.entity";
import { Team } from "db/entity/team.entity";
import { createUser } from "lib/UserService";
import { createTeam } from "lib/TeamService";
import { jerseyColors } from "lib/teamUtils";



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
