
import { User } from 'db/entity/user.entity';
import { Team } from 'db/entity/team.entity';
import { Lineup } from 'db/entity/lineup.entity';
import { Player } from 'db/entity/player.entity';

import Database from 'db/database';
import { createRandomLineup, validateLineup } from './playerUtils';
import { createTeamPlayers } from './playerUtilsServer';
import { saveInitialStats } from './PlayerService';

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
            const savedPlayers:Player[] = [];
            for (let i=0; i<players.length; i++) {
                const savedPlayer:Player = await playerRepository.save(players[i]);
                savedPlayers.push(savedPlayer);
                await saveInitialStats(savedPlayer, transactionalEntityManager)
            }

            // Save default lineup
            const lineupPlayers = createRandomLineup(savedPlayers);
            const currentLineup = await lineupRepository.save({
                players: lineupPlayers,
            });

            // Set current lineup
            team.currentLineup = currentLineup;
            await teamRepository.save(team);

            // Avoid circular reference
            return teamRepository.findOne(team.id, {relations: ['players', 'currentLineup', 'currentLineup.players']});
        } catch (error) {
            console.log("create team error: ", error);
            throw new Error("create team error: " + error);
        }
    });
}

export async function findTeam(id:number):Promise<Team> {
    const db = await new Database().getManager();
    const teamRepository = db.getRepository(Team);

    const team = await teamRepository.findOne(id, {relations: ["user", "players", "currentLineup", "currentLineup.players"]});
    if (team) {
        return team;
    } else {
        throw new Error("Team not found.");
    }
}


export async function saveLineup(teamId:number, playerIds:number[], userId:number):Promise<Lineup> {
    const db = await new Database().getManager();

    return db.transaction(async (transactionalEntityManager) => {
        const lineupRepository = transactionalEntityManager.getRepository(Lineup);
        const teamRepository = transactionalEntityManager.getRepository(Team);

        const team = await teamRepository.findOne(teamId, {relations: ["user", "players"]});
        if (team.user.id != userId) {
            throw new Error("Este no es tu equipo.");
        }

        const lineupPlayers = team.players.filter(p => playerIds.includes(p.id));

        // Validate lineup
        const validationResult = validateLineup(lineupPlayers, true);
        if (validationResult.hasErrors) {
            throw new Error(validationResult.messages[0].msg);
        }

        const lineup:Lineup = await lineupRepository.save({
            players: lineupPlayers
        });

        // Assign to team
        team.currentLineup = lineup;
        await teamRepository.save(team);

        return lineup;
    });
}
