
import connection from '../db/connection';
import { MatchStep, Match } from '../db/entity/match.entity';

export async function saveMatch(match:Match, steps:MatchStep[]) {

    const db = await connection();
    const matchRepository = db.getRepository(Match);
    const matchStepRepository = db.getRepository(MatchStep);

    // Save match
    match.stepsCount = steps.length;
    const savedMatch = await matchRepository.save(match);

    // Save match steps
    for (let i=0; i<steps.length; i++) {
        const s = steps[i];
        s.match = match;
        await matchStepRepository.save(s);
    }

    return savedMatch;
}

export async function findMatch(id:string):Promise<Match> {
    const db = await connection();
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
    const db = await connection();
    const matchRepository = db.getRepository(Match);
    return matchRepository.createQueryBuilder("match")
        .leftJoinAndSelect("match.home", "home")
        .leftJoinAndSelect("home.user", "homeUser")
        .leftJoinAndSelect("match.away", "away")
        .leftJoinAndSelect("away.user", "awayUser")
        .where("homeUser.id = :id or awayUser.id = :id", {id: userId})
        .getMany();
}
