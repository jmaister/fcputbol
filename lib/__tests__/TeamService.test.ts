
import {describe, expect, it, test} from '@jest/globals';

import {createUser} from '../UserService';

import { createTeam, findTeam } from 'lib/TeamService';
import { colors } from 'lib/teamUtils';
import { createRandomUsername } from './TestUtils';

import { User } from 'db/entity/user.entity';
import { Team } from 'db/entity/team.entity';


test('Create team', async () => {

    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();

    const savedTeam:Team = await createTeam({
        name: 'Team One',
        userId: user.id,
        jersey_color: colors[0].value,
    });
    expect(savedTeam).not.toBeNull();

    const team = await findTeam(savedTeam.id);
    console.log("team", team);
    expect(team).not.toBeNull();
    expect(team.players.length).toBe(18);
});


export {}
