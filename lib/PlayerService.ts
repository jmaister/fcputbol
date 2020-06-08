
import { Player, PlayerPoints, PlayerStatList, PlayerStat, PlayerStatFieldList } from 'db/entity/player.entity';

import { EntityManager } from 'typeorm';
import Database from 'db/database';
import { UserAssets, User, UserAssetType, UserAssetSubType } from 'db/entity/user.entity';
import { getUserAssets, UserAssetInfo } from './UserService';
import { League } from 'db/entity/league.entity';

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

export async function saveNewStatPoint(leagueId: number, userId: number, playerId: number, points:number, stat:PlayerStat): Promise<Player> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const playerRepository = db.getRepository(Player);

    // TODO: check that player belongs to user
    const league = await leagueRepository.findOne(leagueId);
    const player = await playerRepository.findOne(playerId);

    // Check UserAssets, validate available
    const currentAssets:UserAssetInfo = await getUserAssets(userId, leagueId, UserAssetType.PLAYER_POINTS, db);
    if (currentAssets.amount <= points) {
        throw new Error("No tienes suficientes puntos.");
    }

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
        await userAssetsRepository.save({
            user,
            league: league,
            amount: -1 * points,
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
