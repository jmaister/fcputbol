
import {describe, expect, it, test} from '@jest/globals';

import {createUser, findUserForLogin, findUser} from '../UserService';
import { User } from 'db/entity/user.entity';
import { createRandomUsername } from './TestUtils';


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
        const user:User = await findUser(9999);
    }).rejects.toThrow('not found');
});


export {}
