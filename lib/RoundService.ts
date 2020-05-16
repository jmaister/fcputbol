
import Database from 'db/database';
import { Round, RoundStatus } from 'db/entity/round.entity';

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
        .where("round.roundDate < :now", {now: now.toISOString()})
        .andWhere("round.status = :status", {status})
        .getMany();
}
