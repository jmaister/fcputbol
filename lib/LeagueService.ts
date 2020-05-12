
import Database from 'db/database';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { Team } from 'db/entity/team.entity';
import { generateCode } from './utils';
import { tournament, MatchPair } from './Tournament';
import { Match, MatchStatus } from 'db/entity/match.entity';
import moment from 'moment';
import { match } from 'assert';

export async function createLeague({ name, yourteam, userId }) {
    const db = await new Database().getManager();

    // TODO: try to avoid a team select
    const teamRepository = db.getRepository(Team);
    const adminTeam = await teamRepository.findOne(yourteam);

    const leagueRepository = db.getRepository(League);
    return leagueRepository.save({
        name: name,
        admin: userId,
        teams: [adminTeam],
        code: generateCode(8),
        status: LeagueStatus.ORGANIZING
    });
}

export async function findLeague(id:string):Promise<League> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    try {
        return leagueRepository.findOne(id, {relations: [
            "teams",
            "teams.user",
            "admin",
            "matches",
            "matches.home", "matches.home.user",
            "matches.away", "matches.away.user",
        ]});
    } catch (error) {
        console.log("_*_*_*_*_*_*_ findLeague error:", error)
        throw new Error("League not found:" + error);
    }
}

export async function findLeagueByCode(code:string):Promise<League> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    try {
        return leagueRepository.createQueryBuilder("league")
            .leftJoinAndSelect("league.teams", "team")
            .leftJoinAndSelect("team.user", "user")
            .leftJoinAndSelect("league.admin", "admin")
            .where("league.code = :code", {code: code})
            .getOne();

    } catch (error) {
        console.log("_*_*_*_*_*_*_ findUserLeagues error:", error)
        throw new Error("Find leagues error:" + error);
    }
}

export async function findUserLeagues(userId:string):Promise<League[]> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    try {
        return leagueRepository.createQueryBuilder("league")
            .leftJoinAndSelect("league.teams", "team")
            .leftJoinAndSelect("team.user", "user")
            .where("user.id = :id", {id: userId})
            .getMany();

    } catch (error) {
        console.log("_*_*_*_*_*_*_ findUserLeagues error:", error)
        throw new Error("Find leagues error:" + error);
    }
}

export async function enterLeague({ yourteam, code, userId }) {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const teamRepository = db.getRepository(Team);
    try {
        const team = await teamRepository.findOne(yourteam, {relations: ["user"]});
        // Check that user and yourteam matches
        if (team.user.id !== userId) {
            throw new Error("El equipo no pertenece a ese usuario.");
        }

        const league = await leagueRepository.createQueryBuilder("league")
            .leftJoinAndSelect("league.teams", "team")
            .where("league.code = :code", {code: code})
            .getOne();

        league.teams.push(team);
        return leagueRepository.save(league);
    } catch (error) {
        console.log("_*_*_*_*_*_*_ findUserLeagues error:", error)
        throw new Error("Find leagues error:" + error);
    }
}

export async function startLeague({id, userId}) {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const matchRepository = db.getRepository(Match);

    try {
        const league = await leagueRepository.findOne(id, {relations: [
            "admin",
            "teams"
        ]});
        if (league.admin.id !== userId) {
            throw new Error("La liga no pertenece a ese usuario.");
        }
        if (league.status !== LeagueStatus.ORGANIZING) {
            throw new Error("La liga no puede ser comenzada. Status: " + league.status);
        }

        // Calculate matches
        const teams = league.teams;
        const n = league.teams.length;
        const rounds:MatchPair[][] = tournament(n);

        // Matches start next day at 12:00:00
        let matchDate = moment().utc().hour(12).minute(0).second(0).add(1, "day");
        console.log("matchDate 1a ", matchDate);
        console.log("matchDate 1b ", matchDate.utc());
        console.log("matchDate 1c ", matchDate.local());
        console.log("matchDate 1d ", matchDate.toISOString());

        for (let r=0; r < rounds.length; r++) {
            const round = rounds[r];
            for (let p=0; p < round.length; p++) {
                const pair = round[p];
                // TODO: calculate team date + time
                matchRepository.save({
                    league,
                    home: teams[pair.home-1],
                    away: teams[pair.away-1],
                    status: MatchStatus.SCHEDULED,
                    round: r,
                    matchDate: matchDate.toISOString()
                });
            }
            // Calcualte next round date
            matchDate = matchDate.add(1, "day");
            console.log("matchDate 2 ", matchDate);
        }

        // Status and Save
        league.status = LeagueStatus.ONGOING;
        league.currentRound = 0;
        league.roundCount = rounds.length;
        return leagueRepository.save(league);

    } catch (error) {
        console.log("_*_*_*_*_*_*_ findUserLeagues error:", error)
        throw new Error("Find leagues error:" + error);
    }
}

