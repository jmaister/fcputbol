
import { Player, PlayerPoints, PlayerStatList } from 'db/entity/player.entity';

import { EntityManager } from 'typeorm';

export async function saveInitialStats(player: Player, db: EntityManager) {

    const playerPointsRepository = db.getRepository(PlayerPoints);

    const playerData = JSON.parse(JSON.stringify(player));

    for (const stat of PlayerStatList) {
        const points = player[stat.toLowerCase()];
        await playerPointsRepository.save({
            player,
            stat,
            points,
        } as PlayerPoints);
    }
    return true;

}
