import moment from "moment";

import Database from "db/database";

import { tournament, MatchPair } from "./Tournament";

import { Classification } from "db/entity/classification.entity";
import { Season, SeasonStatus } from "db/entity/season.entity";
import { League, LeagueStatus } from "db/entity/league.entity";
import { Round, RoundStatus } from "db/entity/round.entity";
import { Match, MatchStatus } from "db/entity/match.entity";
import { UserAssets, UserAssetType, UserAssetSubType } from "db/entity/user.entity";
import { constants } from "./constants";


interface CreateSeasonProps {
    name: string
    leagueId: number
    userId: number
}

export async function createSeason({name, leagueId, userId}:CreateSeasonProps): Promise<Season> {

    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const league = await leagueRepository.findOne(leagueId, {
        relations: ["seasons", "currentSeason", "admin", "teams", "teams.user"]
    });
    const now = new Date();

    if (league.admin.id !== userId) {
        throw new Error("No eres el administrador de esta liga.");
    }
    if (league.status != LeagueStatus.ORGANIZING) {
        throw new Error("No se puede crear una nueva temporada. Liga: " + league.status);
    }
    if (league.teams.length < 2) {
        throw new Error("Debe haber al menos 2 equipos para empezar la temporada.");
    }

    return db.transaction(async (transactionalEntityManager) => {
        const leagueRepository = transactionalEntityManager.getRepository(League);
        const seasonRepository = transactionalEntityManager.getRepository(Season);
        const roundRepository = transactionalEntityManager.getRepository(Round);
        const matchRepository = transactionalEntityManager.getRepository(Match);
        const classificationRepository = transactionalEntityManager.getRepository(Classification);
        const userMoneyRepository = transactionalEntityManager.getRepository(UserAssets);

        // Give users the MONEY_SEASON_START and PLAYER_POINTS_SEASON_START
        for (let team of league.teams) {
            await userMoneyRepository.save({
                user: team.user,
                league,
                amount: constants.MONEY_SEASON_START,
                type: UserAssetType.MONEY,
                subType: UserAssetSubType.SEASON_START,
                date: now,
            });
            await userMoneyRepository.save({
                user: team.user,
                league,
                amount: constants.PLAYER_POINTS_SEASON_START,
                type: UserAssetType.PLAYER_POINTS,
                subType: UserAssetSubType.SEASON_START,
                date: now,
            });
        }

        // Create season
        let seasonNumber = league.seasons ? league.seasons.length : 0;
        const season = await seasonRepository.save({
            name: name,
            league,
            seasonNumber,
            status: SeasonStatus.SCHEDULED,
        });

        // Update league
        league.status = LeagueStatus.ONGOING;
        league.currentSeason = season;
        await leagueRepository.save(league);

        // Calculate matches
        const teams = league.teams;
        const n = league.teams.length;
        const calculatedRounds:MatchPair[][] = tournament(n);

        // Matches start next day at 12:00:00 UTC
        let roundDate = moment(now).utc().hour(12).minute(0).second(0).millisecond(0).add(1, "day");

        for (let r=0; r < calculatedRounds.length; r++) {
            const calculatedRound = calculatedRounds[r];
            // Lineup freeze is 30 minutes before roundDate
            let freezeLineupDate = moment(roundDate).add(-30, "minute");

            const round = await roundRepository.save({
                season,
                roundNumber: r,
                roundCount: calculatedRounds.length,
                roundDate: roundDate.toDate(),
                freezeLineupDate: freezeLineupDate.toDate(),
                status: RoundStatus.SCHEDULED,
            });

            for (let m=0; m < calculatedRound.length; m++) {
                const matchPair = calculatedRound[m];
                await matchRepository.save({
                    home: teams[matchPair.home-1],
                    away: teams[matchPair.away-1],
                    status: MatchStatus.SCHEDULED,
                    round: round,
                });
            }
            // Calcualte next round date
            roundDate = roundDate.add(1, "day");
        }

        // Create classification
        for (let i=0; i<teams.length; i++) {
            await classificationRepository.save({
                season,
                league,
                team: teams[i],
                points: 0,
                goalsScored: 0,
                goalsAgainst: 0,
            });
        }

        season.currentRound = 0;
        season.roundCount = calculatedRounds.length;
        await seasonRepository.save(season);

        // Avoid circular refs
        return seasonRepository.findOne(season.id, {relations: ["rounds", "rounds.matches"]});
    });
}

export async function findSeason(seasonId): Promise<Season> {
    const db = await new Database().getManager();
    const seasonRepository = db.getRepository(Season);

    return seasonRepository.findOne(seasonId, {relations: ['league', 'rounds', 'classifications']});
}
