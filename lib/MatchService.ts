
import { MatchStep, Match, MatchStatus } from '../db/entity/match.entity';
import Database from 'db/database';
import moment from 'moment';
import { MatchResult, play } from './play/probs';
import { Classification } from 'db/entity/classification.entity';


export async function playMatch(match:Match): Promise<Match> {
    // Play a match
    const result: MatchResult = play(match.home, match.away);

    match.homeLineup = match.home.currentLineup;
    match.awayLineup = match.away.currentLineup;

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
        .leftJoinAndSelect("round.league", "league")
        .leftJoinAndSelect("match.home", "home")
        .leftJoinAndSelect("home.user", "homeUser")
        .leftJoinAndSelect("home.currentLineup", "homeLineup").leftJoinAndSelect("homeLineup.players", "homePlayers")
        .leftJoinAndSelect("match.away", "away")
        .leftJoinAndSelect("away.user", "awayUser")
        .leftJoinAndSelect("away.currentLineup", "awayLineup").leftJoinAndSelect("awayLineup.players", "awayPlayers")
        .where("match.id < :matchId", {matchId})
        .getOne();
}
