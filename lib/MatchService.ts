
import { MatchStep, Match, MatchStatus } from '../db/entity/match.entity';
import Database from 'db/database';
import moment from 'moment';
import { MatchResult, play } from './play/probs';


export async function playMatch(match:Match): Promise<Match> {
    // Play a match
    const result: MatchResult = play(match.home, match.away);

    match.homeLineup = match.home.lineup;
    match.awayLineup = match.away.lineup;

    return saveMatch(match, result);
}

export async function saveMatch(match:Match, matchResult:MatchResult): Promise<Match> {
    try {
        const db = await new Database().getManager();
        const matchToReturn = await db.transaction(async (transactionalEntityManager) => {
            const matchRepository = transactionalEntityManager.getRepository(Match);
            const matchStepRepository = transactionalEntityManager.getRepository(MatchStep);

            match.resultHome = matchResult.score[0];
            match.resultAway = matchResult.score[1];
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
            return savedMatch;
        });
        return matchToReturn;
    } catch (error) {
        throw new Error("Error on saveMatch: " + error);
    }
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

export async function findMatches(userId:string):Promise<Match[]> {
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

export async function findMatchesByStatus(now:Date, status:MatchStatus):Promise<Match[]> {
    const db = await new Database().getManager();
    const matchRepository = db.getRepository(Match);
    return matchRepository.createQueryBuilder("match")
        .leftJoinAndSelect("match.home", "home")
        .leftJoinAndSelect("home.user", "homeUser")
        .leftJoinAndSelect("home.lineup", "homeLineup").leftJoinAndSelect("homeLineup.players", "homePlayers")
        .leftJoinAndSelect("match.away", "away")
        .leftJoinAndSelect("away.user", "awayUser")
        .leftJoinAndSelect("away.lineup", "awayLineup").leftJoinAndSelect("awayLineup.players", "awayPlayers")
        .where("match.matchDate < :now", {now: now.toISOString()})
        .andWhere("match.status = :status", {status})
        .getMany();
}
