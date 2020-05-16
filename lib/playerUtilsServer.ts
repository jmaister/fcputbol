import { Player } from "db/entity/player.entity";

import RandomData from './random-data'
import { randomIntInterval } from "./utils";
import { Team } from "db/entity/team.entity";
import { allPositions } from "./playerUtils";

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
