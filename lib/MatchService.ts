
import { MatchResult, play } from './play/probs';

import Database from 'db/database';
import { MatchStep, Match, MatchStatus } from '../db/entity/match.entity';
import { Classification } from 'db/entity/classification.entity';
import { EntityManager } from 'typeorm';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { UserAssets, UserAssetType, UserAssetSubType } from 'db/entity/user.entity';
import { constants } from './constants';


export async function playMatch(now: Date, matchId: number, db?:EntityManager): Promise<Match> {
    if (!db) {
        db = await new Database().getManager();
    }

    // Play a match
    const match = await findMatchToPlay(matchId, db);
    const matchResult: MatchResult = play(match.home, match.away);

    return db.transaction(async (transactionalEntityManager) => {
        try {
            const matchRepository = transactionalEntityManager.getRepository(Match);
            const matchStepRepository = transactionalEntityManager.getRepository(MatchStep);
            const userMoneyRepository = transactionalEntityManager.getRepository(UserAssets);

            match.resultHome = matchResult.score[0];
            match.resultAway = matchResult.score[1];
            if (match.resultHome > match.resultAway) {
                match.homePoints = 3;
                match.awayPoints = 0;
                match.homeWin = true;
                match.draw = false;
                match.awayWin = false;
            } else if (match.resultHome === match.resultAway) {
                match.homePoints = 1;
                match.awayPoints = 1;
                match.homeWin = false;
                match.draw = true;
                match.awayWin = false;
            } else if (match.resultHome < match.resultAway) {
                match.homePoints = 0;
                match.awayPoints = 3;
                match.homeWin = false;
                match.draw = false;
                match.awayWin = true;
            }

            // Save match steps
            for (let i=0; i<matchResult.steps.length; i++) {
                const s = matchResult.steps[i];
                s.match = match;
            }

            match.stepsCount = matchResult.steps.length;
            match.playDate = now;
            match.status = MatchStatus.FINISHED;
            match.matchSteps = matchResult.steps;
            const savedMatch = await matchRepository.save(match);

            // Update classification
            // Home
            await transactionalEntityManager
                .createQueryBuilder()
                .update(Classification)
                .set({
                    points: () => "points + " + match.homePoints,
                    goalsScored: () => "goalsScored + " + match.resultHome,
                    goalsAgainst: () => "goalsAgainst + " + match.resultAway,
                })
                .where("season.id = :seasonId and team.id = :teamId", { seasonId: match.round.season.id, teamId: match.home.id })
                .execute();
            // Away
            await transactionalEntityManager
                .createQueryBuilder()
                .update(Classification)
                .set({
                    points: () => "points + " + match.awayPoints,
                    goalsScored: () => "goalsScored + " + match.resultAway,
                    goalsAgainst: () => "goalsAgainst + " + match.resultHome,
                })
                .where("season.id = :seasonId and team.id = :teamId", { seasonId: match.round.season.id, teamId: match.away.id })
                .execute();

            // Update users money: MONEY_MATCH_WIN, MONEY_MATCH_DRAW, MONEY_MATCH_LOSE, MONEY_PER_GOAL
            if (match.resultHome > 0) {
                await userMoneyRepository.save({
                    user: match.home.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_PER_GOAL * match.resultHome,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.GOAL,
                    date: now,
                });
            }
            if (match.resultAway > 0) {
                await userMoneyRepository.save({
                    user: match.away.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_PER_GOAL * match.resultAway,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.GOAL,
                    date: now,
                });
            }
            if (match.homeWin) {
                await userMoneyRepository.save({
                    user: match.home.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_WIN,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_WIN,
                    date: now,
                });
                await userMoneyRepository.save({
                    user: match.away.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_LOSE,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_LOSE,
                    date: now,
                });
            } else if(match.draw) {
                await userMoneyRepository.save({
                    user: match.home.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_DRAW,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_DRAW,
                    date: now,
                });
                await userMoneyRepository.save({
                    user: match.away.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_DRAW,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_DRAW,
                    date: now,
                });
            } else {
                await userMoneyRepository.save({
                    user: match.home.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_LOSE,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_LOSE,
                    date: now,
                });
                await userMoneyRepository.save({
                    user: match.away.user,
                    league: match.round.season.league,
                    amount: constants.MONEY_MATCH_WIN,
                    type: UserAssetType.MONEY,
                    subType: UserAssetSubType.MATCH_WIN,
                    date: now,
                });
            }

            // Avoid circular ref
            return matchRepository.findOne(match.id);
        } catch (error) {
            console.log("error on saveMatch", error);
            console.log("error on saveMatch", error.stack);
            throw new Error("Error on saveMatch: " + error);
        }
    });
}

export async function findMatch(id:string):Promise<Match> {
    const db = await new Database().getManager();
    const matchRepository = db.getRepository(Match);
    try {
        return matchRepository.findOne(id, {relations: [
            "home", "away",
            "home.user", "away.user",
            "homeLineup", "homeLineup.players", "awayLineup", "awayLineup.players",
            "matchSteps", "matchSteps.player", "matchSteps.player2"

        ]});
    } catch (error) {
        throw new Error("Match not found:" + error);
    }
}

export async function findMatchesByUser(userId:string):Promise<Match[]> {
    const db = await new Database().getManager();
    const matchRepository = db.getRepository(Match);
    return matchRepository.createQueryBuilder("match")
        .leftJoinAndSelect("match.home", "home")
        .leftJoinAndSelect("home.user", "homeUser")
        .leftJoinAndSelect("match.away", "away")
        .leftJoinAndSelect("away.user", "awayUser")
        .where("homeUser.id = :id or awayUser.id = :id", {id: userId})
        .getMany();
}

export async function findMatchToPlay(matchId:number, db?:EntityManager):Promise<Match> {
    if (!db) {
        db = await new Database().getManager();
    }
    const matchRepository = db.getRepository(Match);
    return matchRepository.createQueryBuilder("match")
        .leftJoinAndSelect("match.round", "round")
        .leftJoinAndSelect("round.season", "season")
        .leftJoinAndSelect("season.league", "league")
        .leftJoinAndSelect("match.home", "home")
        .leftJoinAndSelect("home.user", "homeUser")
        .leftJoinAndSelect("home.currentLineup", "homeLineup").leftJoinAndSelect("homeLineup.players", "homePlayers")
        .leftJoinAndSelect("match.away", "away")
        .leftJoinAndSelect("away.user", "awayUser")
        .leftJoinAndSelect("away.currentLineup", "awayLineup").leftJoinAndSelect("awayLineup.players", "awayPlayers")
        .where("match.id = :matchId", {matchId})
        .andWhere("match.status = :status", {status: MatchStatus.READY})
        .getOne();
}


export async function freezeLineups(now:Date):Promise<Match[]> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);

    const leagues = await leagueRepository.createQueryBuilder('league')
        .where('league.status != :status', {status: LeagueStatus.FINISHED})
        .getMany();

    let matches = [];
    for (let league of leagues) {
        const m = await freezeLineupsForLeague(now, league.id);
        matches = matches.concat(m);
    }
    return matches;
}

export async function freezeLineupsForLeague(now:Date, leagueId:number):Promise<Match[]> {
    const db = await new Database().getManager();

    return db.transaction(async (transactionalEntityManager) => {
        try {
            const matchRepository = transactionalEntityManager.getRepository(Match);

            const matches = await matchRepository.createQueryBuilder('match')
                .leftJoinAndSelect("match.round", "round")
                .leftJoinAndSelect("round.season", "season")
                .leftJoinAndSelect("season.league", "league")
                .leftJoinAndSelect("match.home", "home")
                .leftJoinAndSelect("home.currentLineup", "homeLineup")
                .leftJoinAndSelect("match.away", "away")
                .leftJoinAndSelect("away.currentLineup", "awayLineup")
                .where("round.freezeLineupDate <= datetime(:now)", {now: now.toISOString()})
                .andWhere("match.status = :status", {status: MatchStatus.SCHEDULED})
                .andWhere("league.id = :li", {li: leagueId})
                .getMany();

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];

                match.homeLineup = match.home.currentLineup;
                match.awayLineup = match.away.currentLineup;
                match.status = MatchStatus.READY;

                await matchRepository.save(match);
            }

            return matches;
        } catch (error) {
            console.log("error on freezeLineups", error);
            throw new Error("error on freezeLineups: " + error);
        }
    });

}
