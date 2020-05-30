import crypto from 'crypto';

import { User, UserMoney, UserMoneyType } from '../db/entity/user.entity';
import Database from '../db/database';
import { Select } from '@material-ui/core';
import { League } from 'db/entity/league.entity';
import { constants } from './constants';
import { MarketBid, MarketBidStatus } from 'db/entity/marketplayer.entity';
import { EntityManager } from 'typeorm';

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

export interface UserMoneyInfo {
    money: number
    blocked: number
    budget: number
    expendable: number
    overSpendPct: number
}


export async function getUserMoney(userId: number, leagueId: number, db?: EntityManager): Promise<UserMoneyInfo> {
    if (!db) {
        db = await new Database().getManager();
    }
    const userMoneyRepository = db.getRepository(UserMoney);
    const marketBidRepository = db.getRepository(MarketBid);

    // Money on UserMoney
    const result = await userMoneyRepository.createQueryBuilder('um')
        .select('SUM(um.amount) AS amount')
        .where("um.user.id = :u", {u: userId})
        .andWhere("um.league.id = :l", {l: leagueId})
        .getRawOne();

    // TODO: return amount per marketPlayer, if user overbids, that amount does not count
    // Money blocked on Bids
    const bidResult = await marketBidRepository.createQueryBuilder('mb')
        .select('SUM(mb.amount) AS amount')
        .where("mb.user.id = :u", {u: userId})
        .andWhere("mb.league.id = :l", {l: leagueId})
        .andWhere("mb.status = :s", {s: MarketBidStatus.PLACED})
        .getRawOne();

    const amount = result.amount || 0;
    const blocked = bidResult.amount || 0;

    let budget = amount + Math.floor(amount * constants.MONEY_OVERSPEND_PCT / 100);
    let expendable = budget - blocked;

    return {
        money: amount,
        blocked: blocked,
        budget: Math.max(0, budget),
        expendable,
        overSpendPct: constants.MONEY_OVERSPEND_PCT,
    };
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
