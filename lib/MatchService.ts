
import moment from 'moment';

import { MatchResult, play } from './play/probs';

import Database from 'db/database';
import { MatchStep, Match, MatchStatus } from '../db/entity/match.entity';
import { Classification } from 'db/entity/classification.entity';


export async function playAndSaveMatch(match:Match): Promise<Match> {
    // Play a match
    const result: MatchResult = play(match.home, match.away);
    return saveMatch(match, result);
}

export async function saveMatch(match:Match, matchResult:MatchResult): Promise<Match> {
        const db = await new Database().getManager();
        return db.transaction(async (transactionalEntityManager) => {
            try {
                const matchRepository = transactionalEntityManager.getRepository(Match);
                const matchStepRepository = transactionalEntityManager.getRepository(MatchStep);

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

                match.stepsCount = matchResult.steps.length;
                match.playDate = moment().toDate();
                match.status = MatchStatus.FINISHED;
                const savedMatch = await matchRepository.save(match);

                // Save match steps
                for (let i=0; i<matchResult.steps.length; i++) {
                    const s = matchResult.steps[i];
                    s.match = savedMatch;
                    await matchStepRepository.save(s);
                }

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

                // Avoid circular ref
                return matchRepository.findOne(match.id);
            } catch (error) {
                console.log("error on saveMatch", error);
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

export async function findMatchToPlay(matchId:number):Promise<Match> {
    const db = await new Database().getManager();
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

    return db.transaction(async (transactionalEntityManager) => {
        try {
            const matchRepository = transactionalEntityManager.getRepository(Match);

            const matches = await matchRepository.createQueryBuilder('match')
                .leftJoinAndSelect("match.round", "round")
                .leftJoinAndSelect("match.home", "home")
                .leftJoinAndSelect("home.currentLineup", "homeLineup")
                .leftJoinAndSelect("match.away", "away")
                .leftJoinAndSelect("away.currentLineup", "awayLineup")
                .where("round.freezeLineupDate <= :now", {now: now.toISOString()})
                .andWhere("match.status = :status", {status: MatchStatus.SCHEDULED})
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
