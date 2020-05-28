
import {describe, expect, it, test} from '@jest/globals';

import {createUser, findUserForLogin, findUser, getUserMoney, createUserMoney} from '../UserService';
import { User, UserMoneyType } from 'db/entity/user.entity';
import { createRandomUsername, createMinimalLeague } from './TestUtils';


test('Create user', async () => {

    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();
});

test('Find user for login', async () => {

    const password = 'testpassword';

    const user:User = await createUser({
        username: createRandomUsername(),
        password: password,
    });
    expect(user).not.toBeNull();

    const userSession = await findUserForLogin({
        username: user.username,
        password: password,
    });
    expect(userSession).not.toBeNull();
    expect(userSession.id).toBe(user.id);
    expect(userSession.username).toBe(user.username);

});

test('Find user for login error', async () => {

    const user:User = await createUser({
        username: createRandomUsername(),
        password: 'test2',
    });
    expect(user).not.toBeNull();

    return expect(async () => {
        return findUserForLogin({
            username: user.username,
            password: 'not the password',
        });
    }).rejects.toThrow('not valid');
});

test('Find user error', async () => {
    return expect(async () => {
        return await findUser(9999);
    }).rejects.toThrow('not found');
});


test('Get user current money', async () => {
    const context = await createMinimalLeague();

    const money = await getUserMoney(context.u1.id, context.league.id);
    expect(money).not.toBeNull();
    expect(money.money).toBe(0);
});

test('Get user current money, movements', async () => {
    const context = await createMinimalLeague();

    const result1 = await getUserMoney(context.u1.id, context.league.id);
    expect(result1).not.toBeNull();
    expect(result1.money).toBe(0);
    expect(result1.budget).toBe(0);

    const userMoney1 = await createUserMoney(context.u1.id, context.league.id, 5000, UserMoneyType.SEASON_START);
    expect(userMoney1).not.toBeNull();

    const result2 = await getUserMoney(context.u1.id, context.league.id);
    expect(result2).not.toBeNull();
    expect(result2.money).toBe(5000);
    expect(result2.budget).toBe(5750);

    const userMoney2 = await createUserMoney(context.u1.id, context.league.id, -2000, UserMoneyType.SEASON_START);
    expect(userMoney2).not.toBeNull();

    const result3 = await getUserMoney(context.u1.id, context.league.id);
    expect(result3).not.toBeNull();
    expect(result3.money).toBe(3000);
    expect(result3.budget).toBe(3450);

    const userMoney3 = await createUserMoney(context.u1.id, context.league.id, -3450, UserMoneyType.SEASON_START);
    expect(userMoney3).not.toBeNull();

    const result4 = await getUserMoney(context.u1.id, context.league.id);
    expect(result4).not.toBeNull();
    expect(result4.money).toBe(-450);
    expect(result4.budget).toBe(0);

});

export {}
