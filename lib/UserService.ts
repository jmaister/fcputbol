import crypto from 'crypto';

import { User } from '../db/entity/user.entity';
import Database from '../db/database';

// TODO: read from ENV
const salt = "SaLtSaLtSaLtSaLt";//.toString('hex');


/**
 * User methods. The example doesn't contain a DB, but for real applications you must use a
 * db here, such as MongoDB, Fauna, SQL, etc.
 */

export async function createUser({ username, password }): Promise<User> {
    // Here you should create the user and save the salt and hashed password (some dbs may have
    // authentication methods that will do it for you so you don't have to worry about it):
    //
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const db = await new Database().getManager();
    const userRepository = db.getRepository(User);
    const user = await userRepository.save({
        username: username,
        password: hash
    }).catch(error => {
        console.log("*_*_*_* ERROR createUser:", error);
        throw new Error("Error creando usuario.");
    });

    return user;
}

interface UserSession {
    id: number
    username: string
}

export async function findUserForLogin({ username, password }): Promise<UserSession> {
    // Here you should lookup for the user in your DB and compare the password:

    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const db = await new Database().getManager();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ username: username, password: hash });
    if (user) {
        return {
            id: user.id,
            username: user.username
        };
    } else {
        //return Promise.reject(new Error("username or password not valid."));
        throw new Error("username or password not valid.");
    }

}

export async function findUser(id: number): Promise<User> {
    const db = await new Database().getManager();
    const userRepository = db.getRepository(User);
    const user = await userRepository
        .findOne(id, { relations: [
            "teams", "teams.players"
        ] });

    if (user) {
        // TODO: clean private fields
        return user;
    } else {
        throw new Error("user not found");
    }
}
