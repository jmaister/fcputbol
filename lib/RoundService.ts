
import Database from 'db/database';
import { Round, RoundStatus } from 'db/entity/round.entity';
import { Season, SeasonStatus } from 'db/entity/season.entity';
import moment from 'moment';
import { League, LeagueStatus } from 'db/entity/league.entity';

export async function saveRound(round:Round):Promise<Round> {
    const db = await new Database().getManager();
    const roundRepository = db.getRepository(Round);
    return roundRepository.save(round);
}

export async function findRoundByStatus(now:Date, status:RoundStatus):Promise<Round[]> {
    const db = await new Database().getManager();
    const roundRepository = db.getRepository(Round);
    return roundRepository.createQueryBuilder("round")
        .leftJoinAndSelect("round.matches", "matches")
        .where("round.roundDate < :now", {now: now})
        .andWhere("round.status = :status", {status})
        .getMany();
}


export async function updateRoundState(roundId: number, newStatus:RoundStatus):Promise<Round> {
    const db = await new Database().getManager();

    return db.transaction(async (transactionalEntityManager) => {
        const roundRepository = transactionalEntityManager.getRepository(Round);
        const seasonRepository = transactionalEntityManager.getRepository(Season);
        const leagueRepository = transactionalEntityManager.getRepository(League);
        try {
            const round = await roundRepository.findOne(roundId, {relations: ["season", "season.league"]});
            round.status = newStatus;
            if (newStatus === RoundStatus.FINISHED) {
                // Update round
                round.finishDate = moment().toDate();

                // Update season
                const season = round.season;
                if (season.currentRound + 1 >= season.roundCount) {
                    season.status = SeasonStatus.FINISHED;

                    // Update league
                    const league = season.league;
                    league.currentSeason = null;
                    league.status = LeagueStatus.ORGANIZING;
                    await leagueRepository.save(league);

                } else {
                    season.currentRound = season.currentRound + 1;
                }
                await seasonRepository.save(season)
            }

            return roundRepository.save(round);
        } catch (error) {
            console.log("error on updateRoundState", error);
            throw new Error("Error on updateRoundState: " + error);
        }
    });
}
