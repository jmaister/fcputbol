
import connection from '../db/connection';
import { User } from '../db/entity/user.entity';
import { Team } from '../db/entity/team.entity';
import { Lineup } from '../db/entity/lineup.entity';
import { Player, Positions } from '../db/entity/player.entity';

import RandomData from './random-data'

import {randomIntInterval, sample} from './utils';

export async function createTeam({ name, jersey_color, username }) {

    const db = await connection();

    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ username: username });

    const teamRepository = db.getRepository(Team);
    const team = await teamRepository.save({
        name: name,
        jersey_color,
        user: user
    });

    // TODO: create and assign team players
    const quantities = [3, 5, 5, 5];
    const positions = [Positions.gk, Positions.def, Positions.mid, Positions.fw];
    const m = 20;

    const playerRepository = db.getRepository(Player);

    const players = {
        [Positions.gk]: [],
        [Positions.def]: [],
        [Positions.mid]: [],
        [Positions.fw]: [],
    };
    // Create players
    let num = 1;
    for (let type = 0; type < quantities.length; type++) {
        const q = quantities[type];
        for (let idx = 0; idx < q; idx++) {
            const pos = positions[type];
            const playerData = {
                name: RandomData.getName(),
                surname: RandomData.getSurname(),
                num: num,
                position: pos,
                save: randomIntInterval(m, m + 10),
                defense: randomIntInterval(m, m + 10),
                pass: randomIntInterval(m, m + 10),
                dribble: randomIntInterval(m, m + 10),
                shot: randomIntInterval(m, m + 10),
                team: team
            };
            const player = await playerRepository.save(playerData);
            players[pos].push(player);
            num++;
        }
    }

    // Create default lineup
    const lineupPlayers = []
        .concat(sample(players[Positions.gk], 1))
        .concat(sample(players[Positions.def], 3))
        .concat(sample(players[Positions.mid], 4))
        .concat(sample(players[Positions.fw], 3));

    const lineupRepository = db.getRepository(Lineup);
    await lineupRepository.save({
        team: team,
        players: lineupPlayers,
    });

    return team;
}

export async function findTeam(id:string):Promise<Team> {
    const db = await connection();
    const teamRepository = db.getRepository(Team);
    try {
        return teamRepository.findOne(id, {relations: ["players", "lineup", "lineup.players"]});
    } catch (error) {
        console.log("_*_*_*_*_*_*_ findTeam error:", error)
        throw new Error("Team not found:" + error);
    }
}
