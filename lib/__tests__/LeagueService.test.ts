
import {describe, expect, it, test} from '@jest/globals';

import {createLeague, enterLeague, findLeague, findLeagueByCode} from '../LeagueService';
import { User } from 'db/entity/user.entity';
import { createUser } from 'lib/UserService';
import { createRandomUsername, createUserAndTeam, createMinimalLeague } from './TestUtils';
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


test('Enter league', async () => {
    const u1 = await createUserAndTeam();
    const u2 = await createUserAndTeam();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });
    expect(league).not.toBeNull();

    const enteredLeague = await enterLeague({
        yourteam: u2.team.id,
        userId: u2.user.id,
        code: league.code,
    })
    expect(enteredLeague).not.toBeNull();
    expect(enteredLeague.teams.length).toBe(2);

});

test('Enter league wrong user', async () => {
    const u1 = await createUserAndTeam();
    const u2 = await createUserAndTeam();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });
    expect(league).not.toBeNull();

    return expect(async () => {
        return await enterLeague({
            yourteam: u2.team.id,
            userId: 999999,
            code: league.code,
        })
    }).rejects.toThrow();

});

test('Enter league wrong team', async () => {
    const u1 = await createUserAndTeam();
    const u2 = await createUserAndTeam();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });
    expect(league).not.toBeNull();

    return expect(async () => {
        return await enterLeague({
            yourteam: 9999999,
            userId: u2.user.id,
            code: league.code,
        })
    }).rejects.toThrow();

});

test('Enter league wrong code', async () => {
    const u1 = await createUserAndTeam();
    const u2 = await createUserAndTeam();

    const league = await createLeague({
        name: 'League Test ' + Math.random(),
        yourteam: u1.team.id,
        userId: u1.user.id,
    });
    expect(league).not.toBeNull();

    return expect(async () => {
        return await enterLeague({
            yourteam: u2.team.id,
            userId: u2.user.id,
            code: 'aaa999aaa999',
        })
    }).rejects.toThrow();

});

test('Find league', async () => {
    const context = await createMinimalLeague();

    const league = await findLeague(context.league.id);
    expect(league).not.toBeNull();
    expect(league.id).toBe(context.league.id)
});

test('Find league, error not valid', async () => {
    return expect(async () => {
        return  await findLeague(9999);
    }).rejects.toThrow();
});

test('Find league by code', async () => {
    const context = await createMinimalLeague();

    const league = await findLeagueByCode(context.league.code);
    expect(league).not.toBeNull();
    expect(league.id).toBe(context.league.id)
});

test('Find league, error not valid', async () => {
    return expect(async () => {
        return  await findLeagueByCode('ab123');
    }).rejects.toThrow();
});

export {}
