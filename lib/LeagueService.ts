
import Database from 'db/database';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { Team } from 'db/entity/team.entity';

import { generateCode } from './utils';

export async function createLeague({ name, yourteam, userId }) {
    const db = await new Database().getManager();

    // TODO: transaction
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
            "currentSeason",
            "currentSeason.classifications", "currentSeason.classifications.team", "currentSeason.classifications.team.user",
            "currentSeason.rounds",
            "currentSeason.rounds.matches",
            "currentSeason.rounds.matches.round",
            "currentSeason.rounds.matches.home", "currentSeason.rounds.matches.home.user",
            "currentSeason.rounds.matches.away", "currentSeason.rounds.matches.away.user",
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
