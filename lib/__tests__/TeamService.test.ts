
import {describe, expect, it, test} from '@jest/globals';

import {createUser, findUser} from '../UserService';

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
    expect(team).not.toBeNull();
    expect(team.players.length).toBe(18);

    const foundUser = await findUser(user.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser.teams.length).toBe(1);
    expect(foundUser.teams[0].players.length).toBe(18);
});


test('Find team error', async () => {

    return expect(async () => {
        const team:Team = await findTeam(9999);
    }).rejects.toThrow('not found')

});


export {}
