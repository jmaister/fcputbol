
import {describe, expect, it, test} from '@jest/globals';

import {createLeague} from '../LeagueService';
import { User } from 'db/entity/user.entity';
import { createUser } from 'lib/UserService';
import { createRandomUsername } from './TestUtils';


test('Create league', async () => {
    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: 1,
        userId: user.id,
    });
    expect(league).not.toBeNull();
    console.log(league);
});


export {}
