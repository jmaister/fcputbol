import { Player, Positions } from "db/entity/player.entity";

import RandomData from './random-data'
import { randomIntInterval, sample } from "./utils";
import { Team } from "db/entity/team.entity";

export function findById(arr:Player[], id:number): Player {
    return arr.find(e => {
        return e.id === id;
    });
};

export function containsId(arr:Player[], id:number): boolean {
    const found = findById(arr, id);
    return !!found;
};

export const allPositions = [Positions.gk, Positions.def, Positions.mid, Positions.fw];

export function createTeamPlayers(team:Team): Player[] {
    // Create and assign team players
    const quantities = [3, 5, 5, 5];
    const avg = 25;
    const std = 5;

    const players:Player[] = [];
    // Create players
    let num = 1;
    for (let type = 0; type < allPositions.length; type++) {
        const pos = allPositions[type];
        const q = quantities[type];
        for (let idx = 0; idx < q; idx++) {
            const playerData = {
                name: RandomData.getName(),
                surname: RandomData.getSurname(),
                num: num,
                position: pos,
                save: randomIntInterval(avg-std, avg+std),
                defense: randomIntInterval(avg-std, avg+std),
                pass: randomIntInterval(avg-std, avg+std),
                dribble: randomIntInterval(avg-std, avg+std),
                shot: randomIntInterval(avg-std, avg+std),
                team: team
            } as Player;
            players.push(playerData);
            num++;
        }
    }

    return players;
}

export function createRandomLineup(players:Player[]) {
    const sortedPlayers = {
        [Positions.gk]: [],
        [Positions.def]: [],
        [Positions.mid]: [],
        [Positions.fw]: [],
    };
    players.forEach(p => {
        sortedPlayers[p.position].push(p);
    })

    const lineupPlayers = []
        .concat(sample(sortedPlayers[Positions.gk], 1))
        .concat(sample(sortedPlayers[Positions.def], 3))
        .concat(sample(sortedPlayers[Positions.mid], 4))
        .concat(sample(sortedPlayers[Positions.fw], 3));
    return lineupPlayers;

}
