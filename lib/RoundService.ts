
import Database from 'db/database';
import { Round, RoundStatus } from 'db/entity/round.entity';
import { Season, SeasonStatus } from 'db/entity/season.entity';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { findMatchToPlay, playMatch } from './MatchService';
import { Match, MatchStatus } from 'db/entity/match.entity';

export async function findRoundByStatus(now:Date, status:RoundStatus):Promise<Round[]> {
    const db = await new Database().getManager();
    const roundRepository = db.getRepository(Round);
    return roundRepository.createQueryBuilder("round")
        .leftJoinAndSelect("round.matches", "matches")
        .where("round.roundDate < :now", {now: now.toISOString()})
        .andWhere("round.status = :status", {status})
        .getMany();
}

export interface UpdateRoundState {
    ok: boolean
    seasonFinished: boolean
    errorMessage?: string
}

export async function updateRoundState(now: Date, roundId: number, newStatus:RoundStatus):Promise<UpdateRoundState> {
    const db = await new Database().getManager();

    return db.transaction(async (transactionalEntityManager) => {
        const roundRepository = transactionalEntityManager.getRepository(Round);
        const seasonRepository = transactionalEntityManager.getRepository(Season);
        const leagueRepository = transactionalEntityManager.getRepository(League);

        let seasonFinished = false;
        try {
            const round = await roundRepository.findOne(roundId, {relations: ["season", "season.league"]});
            round.status = newStatus;
            if (newStatus === RoundStatus.FINISHED) {
                // Update round
                round.finishDate = now;

                // Update season
                const season = round.season;
                if (season.currentRound + 1 >= season.roundCount) {
                    // Season finished
                    season.status = SeasonStatus.FINISHED;

                    // Update league
                    const league = season.league;
                    league.currentSeason = null;
                    league.status = LeagueStatus.ORGANIZING;
                    await leagueRepository.save(league);

                    seasonFinished = true;
                } else {
                    // Move to next round
                    season.currentRound = season.currentRound + 1;
                }
                await seasonRepository.save(season)
            }

            await roundRepository.save(round);

            return {
                ok: true,
                seasonFinished: seasonFinished
            } as UpdateRoundState;
        } catch (error) {
            return {
                ok: false,
                seasonFinished: seasonFinished,
                errorMessage: error,
            } as UpdateRoundState;
        }
    });
}

export interface RoundProcessInfo {
    roundId: number
    processedMatches: number
    matchesToProcess: number
    errors: any[]
    errorCount: number
    roundFinished: boolean
    seasonFinished: boolean
}

export async function playRound(now: Date, roundId:number): Promise<RoundProcessInfo> {
    const db = await new Database().getManager();

    const roundRepository = db.getRepository(Round);
    const matchRepository = db.getRepository(Match);

    const matchesToProcess = await matchRepository.createQueryBuilder('m')
        .leftJoin('m.round', 'round')
        .where("m.round.id = :r", {r: roundId})
        .andWhere("m.status = :s", {s: MatchStatus.READY})
        .andWhere("round.roundDate <= datetime(:now)", {now: now.toISOString()})
        .andWhere("round.status = :rs", {rs: RoundStatus.SCHEDULED})
        .getMany();

    const errors = [];
    let processedMatches = 0;
    let matchErrorCount = 0;

    for (let match of matchesToProcess) {
        try {
            await playMatch(match.id, db);
        } catch (error) {
            console.log("Failed match id " + match.id, error);
            errors.push("Failed match id " + match.id + ": " + error.message);
            matchErrorCount++;
        }
        processedMatches++;
    }

    // Update season state
    let roundFinished = false;
    let seasonFinished = false;
    if (matchErrorCount === 0) {
        // Update round if all matches are finished
        const round = await roundRepository.findOne(roundId, {relations: ["matches"]});
        if (round.matches.filter(m => m.status === MatchStatus.FINISHED).length == round.matches.length) {
            const updateRoundResult = await updateRoundState(now, round.id, RoundStatus.FINISHED);
            roundFinished = true;
            seasonFinished = updateRoundResult.seasonFinished;
        }
    }

    const info:RoundProcessInfo = {
        roundId: roundId,
        errorCount: matchErrorCount,
        errors: errors,
        processedMatches: processedMatches,
        matchesToProcess: matchesToProcess.length,
        roundFinished,
        seasonFinished,
    };
    return info;
}

export interface PlayRoundsResult {
    ok: boolean
    roundsToProcess: number
    processedRounds: number
    infoList: RoundProcessInfo[]
}

export async function playRounds(now: Date): Promise<PlayRoundsResult> {
    const rounds:Round[] = await findRoundByStatus(now, RoundStatus.SCHEDULED);
    const roundsCount = rounds.length;
    let processedRounds = 0;
    const infoList:RoundProcessInfo[] = [];

    for (let round of rounds) {
        const info = await playRound(now, round.id);
        infoList.push(info);
        processedRounds++;
    }

    return {ok: true, processedRounds, roundsToProcess: roundsCount, infoList};
}
