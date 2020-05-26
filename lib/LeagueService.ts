
import Database from 'db/database';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { Team } from 'db/entity/team.entity';

import { generateCode } from './utils';

export async function createLeague({ name, yourteam, userId }) {
    const db = await new Database().getManager();

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
            "seasons",
            "seasons.classifications", "seasons.classifications.team", "seasons.classifications.team.user",
            "seasons.rounds",
            "seasons.rounds.matches",
            "seasons.rounds.matches.round",
            "seasons.rounds.matches.home", "seasons.rounds.matches.home.user",
            "seasons.rounds.matches.away", "seasons.rounds.matches.away.user",
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

export async function findUserLeagues(userId:number):Promise<League[]> {
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

interface EnterLeagueParams {
    yourteam: number
    code: string
    userId: number
}
export async function enterLeague({ yourteam, code, userId }: EnterLeagueParams): Promise<League> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const teamRepository = db.getRepository(Team);
    try {
        const team = await teamRepository.findOne(yourteam, {relations: ["user"]});
        // Check that user and yourteam matches
        if (!team) {
            throw new Error("El equipo no existe.");
        }
        if (team.user.id !== userId) {
            throw new Error("El equipo no pertenece a ese usuario.");
        }

        const league = await leagueRepository.createQueryBuilder("league")
            .leftJoinAndSelect("league.teams", "team")
            .where("league.code = :code", {code: code})
            .getOne();
        if (!league) {
            throw new Error("La liga no existe.");
        }

        league.teams.push(team);
        return leagueRepository.save(league);
    } catch (error) {
        console.log("_*_*_*_*_*_*_ enterLeague error:", error)
        throw new Error("enterLeague error:" + error);
    }
}
