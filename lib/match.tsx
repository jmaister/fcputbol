
import connection from '../db/connection';
import { Team } from '../db/entity/team.entity';
import { MatchStep, Match } from '../db/entity/match.entity';

export async function saveMatch(match:Match, steps:MatchStep[]) {

    const db = await connection();

    const matchRepository = db.getRepository(Match);
    const savedMatch = await matchRepository.save(match);

    const matchStepRepository = db.getRepository(MatchStep);
    for (let i=0; i<steps.length; i++) {
        const s = steps[i];
        s.match = match;
        // TODO: fix
        s.t = 1;
        await matchStepRepository.save(s);
    }

    return savedMatch;
}

export async function findTeam(id:string):Promise<Team> {
    const db = await connection();
    const teamRepository = db.getRepository(Team);
    try {
        return teamRepository.findOne(id, {relations: ["players", "lineup", "lineup.players"]});
    } catch (error) {
        throw new Error("Team not found:" + error);
    }
}
