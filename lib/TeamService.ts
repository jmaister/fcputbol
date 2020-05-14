
import { User } from '../db/entity/user.entity';
import { Team } from '../db/entity/team.entity';
import { Lineup } from '../db/entity/lineup.entity';
import { Player, Positions } from '../db/entity/player.entity';

import {randomIntInterval, sample, containsElement} from './utils';
import Database from 'db/database';
import { createTeamPlayers, createRandomLineup, flattenPlayers } from './playerUtils';

export async function createTeam({ name, jersey_color, userId }) {

    const db = await new Database().getManager();
    return await db.transaction(async (transactionalEntityManager):Promise<Team> => {
        const lineupRepository = transactionalEntityManager.getRepository(Lineup);
        const userRepository = transactionalEntityManager.getRepository(User);
        const teamRepository = transactionalEntityManager.getRepository(Team);
        const playerRepository = transactionalEntityManager.getRepository(Player);

        try {
            const user = await userRepository.findOne(userId);

            // Create team
            const team = await teamRepository.save({
                name: name,
                jersey_color,
                user: user
            });

            // Create players
            const players = createTeamPlayers(team);
            const savedPlayers = [];
            for (let i=0; i<players.length; i++) {
                const savedPlayer:Player = await playerRepository.save(players[i]);
                savedPlayers.push(savedPlayer);
            }

            // Save default lineup
            const lineupPlayers = createRandomLineup(savedPlayers);
            const currentLineup = await lineupRepository.save({
                players: lineupPlayers,
            });

            // Set current lineup
            team.currentLineup = currentLineup;
            return teamRepository.save(team);
        } catch (error) {
            console.log("create team error: ", error);
            throw new Error("create team error: " + error);
        }
    });
}

export async function findTeam(id:string):Promise<Team> {
    const db = await new Database().getManager();
    const teamRepository = db.getRepository(Team);
    try {
        return teamRepository.findOne(id, {relations: ["players", "lineup", "lineup.players"]});
    } catch (error) {
        console.log("_*_*_*_*_*_*_ findTeam error:", error)
        throw new Error("Team not found:" + error);
    }
}



export async function saveLineup(teamId:string, playerIds:number[], userId:number):Promise<Lineup> {
    const db = await new Database().getManager();
    const lineupRepository = db.getRepository(Lineup);
    const teamRepository = db.getRepository(Team);

    console.log("saveLineup", teamId, playerIds, userId);

    // TODO: transaction
    try {
        const team = await teamRepository.findOne(teamId, {relations: ["user", "players"]});
        if (team.user.id != userId) {
            throw new Error("Este no es tu equipo.");
        }

        console.log("saveLineup team players", team.players);

        const lineupPlayers = team.players.filter(p => containsElement(playerIds, p.id));
        console.log("saveLineup found playes", lineupPlayers.length, lineupPlayers);

        // TODO: utilizar la misma función de validación
        if (lineupPlayers.length != 11) {
            throw new Error("Debe seleccionar 11 jugadores...");
        }

        const lineup = await lineupRepository.save({
            players: lineupPlayers
        });

        // Assign to team
        team.currentLineup = lineup;
        teamRepository.save(team);

        return lineup;

    } catch (error) {
        console.log("_*_*_*_*_*_*_ saveLineup error:", error)
        throw new Error("saveLineup error:" + error);
    }
}
