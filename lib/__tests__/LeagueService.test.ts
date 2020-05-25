
import {describe, expect, it, test} from '@jest/globals';

import {createLeague} from '../LeagueService';
import { User } from 'db/entity/user.entity';
import { createUser } from 'lib/UserService';
import { createRandomUsername } from './TestUtils';
import { createTeam } from 'lib/TeamService';
import { Team } from 'db/entity/team.entity';
import { jerseyColors } from 'lib/teamUtils';
import { LeagueStatus } from 'db/entity/league.entity';


test('Create league', async () => {
    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();

    const team:Team = await createTeam({
        name: 'Team One',
        userId: user.id,
        jersey_color: jerseyColors[0].value,
    });
    expect(user).not.toBeNull();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: team.id,
        userId: user.id,
    });
    expect(league).not.toBeNull();
    expect(league.status).toBe(LeagueStatus.ORGANIZING);
});


export {}
