
import connection from '../db/connection';
import { User } from '../db/entity/user.entity';
import { Team } from '../db/entity/team.entity';
import { Lineup } from '../db/entity/lineup.entity';
import { Player, Positions } from '../db/entity/player.entity';

import RandomData from '../lib/random-data'

import {range, randomIntInterval, sample} from '../lib/utils';

export async function createTeam({ name, username }) {

    const db = await connection();

    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ username: username });

    const teamRepository = db.getRepository(Team);
    const team = await teamRepository.save({
        name: name,
        user: user
    });

    // TODO: create and assign team players
    const quantities = [3, 5, 5, 5];
    const positions = [Positions.gk, Positions.def, Positions.mid, Positions.fw];
    const m = 20;

    const playerRepository = db.getRepository(Player);
    console.log("player repository", playerRepository);

    const players = {
        [Positions.gk]: [],
        [Positions.def]: [],
        [Positions.mid]: [],
        [Positions.fw]: [],
    };
    // Create players
    let num = 1;
    for (let idx = 0; idx < quantities.length; idx++) {
        const q = quantities[idx];
        console.log("f1", q, idx)
        for (let idx2 = 0; idx2 < q; idx2++) {
            console.log("f2", idx2)
            const pos = positions[idx];
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
    const lineupData = {
        team: team,
        gk: sample(players[Positions.gk], 1),
        def: sample(players[Positions.def], 3),
        mid: sample(players[Positions.mid], 4),
        fw: sample(players[Positions.fw], 3),
    };

    const lineupRepository = db.getRepository(Lineup);
    const lineup = await lineupRepository.save(lineupData);
    console.log("******* lineup", lineup);

    return team;
}

export async function findTeam(id) {
    const db = await connection();
    const teamRepository = db.getRepository(Team);
    const team = await teamRepository.findOne(id, {relations: ["players"]});

    if (team) {
        return team;
    } else {
        throw new Error("Team not found");
    }
}
