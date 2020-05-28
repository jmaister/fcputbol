import crypto from 'crypto';

import { User, UserMoney, UserMoneyType } from '../db/entity/user.entity';
import Database from '../db/database';
import { Select } from '@material-ui/core';
import { League } from 'db/entity/league.entity';
import { constants } from './constants';

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

export async function findUser(userId: number): Promise<User> {
    const db = await new Database().getManager();
    const userRepository = db.getRepository(User);
    const user = await userRepository
        .findOne(userId, { relations: [
            "teams", "teams.players"
        ] });

    if (user) {
        // TODO: clean private fields
        return user;
    } else {
        throw new Error("user not found");
    }
}

interface UserMoneyInfo {
    money: number
    budget: number
}

export async function getUserMoney(userId: number, leagueId: number): Promise<UserMoneyInfo> {
    const db = await new Database().getManager();
    const userMoneyRepository = db.getRepository(UserMoney);
    const result = await userMoneyRepository.createQueryBuilder('um')
        .select('SUM(um.amount) AS amount')
        .where("um.user.id = :u", {u: userId})
        .andWhere("um.league.id = :l", {l: leagueId})
        .getRawOne();

    if (result.amount) {
        const amount = result.amount;
        const budget = result.amount + Math.floor(amount * constants.MONEY_MAX_NEGATIVE_PCT / 100);
        return {
            money: amount,
            budget: Math.max(0, budget),
        };
    } else {
        return {
            money: 0,
            budget: 0,
        }
    }
}

export async function createUserMoney(userId: number, leagueId: number, amount:number, type:UserMoneyType): Promise<UserMoney> {
    const db = await new Database().getManager();
    const userMoneyRepository = db.getRepository(UserMoney);
    const userRepository = db.getRepository(User);
    const leagueRepository = db.getRepository(League);

    const user = await userRepository.findOne(userId);
    const league = await leagueRepository.findOne(leagueId);

    return userMoneyRepository.save({
        user,
        league,
        amount,
        type,
        date: new Date(),
    });
}
