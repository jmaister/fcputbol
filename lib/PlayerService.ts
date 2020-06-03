
import { Player, PlayerPoints, PlayerStatList, PlayerStat } from 'db/entity/player.entity';

import { EntityManager } from 'typeorm';
import Database from 'db/database';
import { UserAssets, User, UserAssetType, UserAssetSubType } from 'db/entity/user.entity';

export async function findPlayer(playerId:number): Promise<Player> {
    const db = await new Database().getManager();

    const playerRepository = db.getRepository(Player);
    return playerRepository.findOne(playerId);
}


export async function savePlayer(player: Player): Promise<Player> {
    const db = await new Database().getManager();

    return db.transaction(async (transactionalEntityManager) => {
        const playerRepository = transactionalEntityManager.getRepository(Player);
        const savedPlayer = await playerRepository.save(player);

        await saveInitialStats(savedPlayer, db);

        return savedPlayer;
    });
}

export async function saveInitialStats(player: Player, db: EntityManager) {

    const playerPointsRepository = db.getRepository(PlayerPoints);

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

export async function saveNewStatPoint(userId: number, player: Player, points:number, stat:PlayerStat): Promise<Player> {
    const db = await new Database().getManager();

    // TODO: check UserAssets, validate available
    // TODO: check that player belongs to user

    return db.transaction(async (transactionalEntityManager) => {
        const playerPointsRepository = transactionalEntityManager.getRepository(PlayerPoints);
        const playerRepository = transactionalEntityManager.getRepository(Player);
        const userRepository = transactionalEntityManager.getRepository(User);
        const userAssetsRepository = transactionalEntityManager.getRepository(UserAssets);

        // Save new stat
        await playerPointsRepository.save({
            player,
            stat,
            points,
        } as PlayerPoints);

        // Update points spending on UserAssets
        const user = await userRepository.findOne(userId);
        userAssetsRepository.save({
            user,
            amount: points,
            date: new Date(),
            player: player,
            type: UserAssetType.PLAYER_POINTS,
            subType: UserAssetSubType.USER_SPENT,
        });

        // Calculate player stats
        const results = await playerPointsRepository.createQueryBuilder('pp')
            .select("pp.stat AS stat, SUM(pp.points) AS amount")
            .where("pp.player.id = :p", {p: player.id})
            .addGroupBy("pp.stat")
            .getRawMany();

        // Update player
        const pl = await playerRepository.findOne(player.id);
        for (const s of results) {
            pl[s.stat.toLowerCase()] = s.amount;
        }
        return playerRepository.save(pl);
    });
}
