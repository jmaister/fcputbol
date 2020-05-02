
import connection from '../db/connection';
import { Team } from '../db/entity/team.entity';
import { MatchStep, Match } from '../db/entity/match.entity';

export async function saveMatch(match:Match, steps:MatchStep[]) {

    const db = await connection();

    const matchRepository = db.getRepository(Match);
    match.stepsCount = steps.length;
    const savedMatch = await matchRepository.save(match);

    const matchStepRepository = db.getRepository(MatchStep);
    for (let i=0; i<steps.length; i++) {
        const s = steps[i];
        s.match = match;
        // TODO: fix step times
        s.t = 1;
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
            "homeLineup", "homeLineup.players", "awayLineup", "awayLineup.players",
            "matchSteps"
        ]});
    } catch (error) {
        throw new Error("Match not found:" + error);
    }
}
