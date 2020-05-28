
import {describe, expect, it, test} from '@jest/globals';

import {createUser, findUser} from '../UserService';

import { createTeam, findTeam, saveLineup } from 'lib/TeamService';
import { jerseyColors, LineupWrapper } from 'lib/teamUtils';
import { createRandomUsername, createUserAndTeam } from './TestUtils';

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
        jersey_color: jerseyColors[0].value,
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
        const team:Team = await findTeam(999999);
    }).rejects.toThrow('not found')

});

test('Save lineup', async () => {
    const {user, team} = await createUserAndTeam();

    const lineupWrapper = new LineupWrapper(team, team.currentLineup);
    const outPlayerId = lineupWrapper.getSortedLineup().def[0].id;
    const inPlayerId = lineupWrapper.getSortedBench().def[0].id;

    lineupWrapper.exchangePlayer(inPlayerId, outPlayerId);

    const savedLineup = await saveLineup(team.id, lineupWrapper.getLineupIds(), user.id);
    expect(savedLineup).not.toBeNull();

});

export {}
