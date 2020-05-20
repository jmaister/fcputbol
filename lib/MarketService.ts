
import moment from 'moment';

import Database from 'db/database';
import { MarketPlayer, MarketBid, MarketPlayerStatus, MarketBidStatus } from 'db/entity/marketplayer.entity';
import { Player } from 'db/entity/player.entity';
import { createPlayer } from './playerUtilsServer';
import { allPositions, calculatePlayerPrice } from './playerUtils';
import { League, LeagueStatus } from 'db/entity/league.entity';

const NUM_PLAYERS_PER_POS = 5;
const DAILY_PLAYERS = NUM_PLAYERS_PER_POS * allPositions.length;

export interface CreateMarketPlayersResult {
    leagueId: number,
    created: number,
    ok: boolean,
}

export async function findMarketPlayers(leagueId:number): Promise<MarketPlayer[]> {
    const db = await new Database().getManager();
    const marketPlayerRepository = db.getRepository(MarketPlayer);
    return marketPlayerRepository.createQueryBuilder('mp')
        .leftJoinAndSelect("mp.player", "player")
        .where('mp.status = :status', {status: MarketPlayerStatus.OPEN})
        .andWhere('mp.league.id = :i', {i: leagueId})
        .getMany();
}

export async function createmarketplayers(now: Date): Promise<CreateMarketPlayersResult[]> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const leagues = await leagueRepository.createQueryBuilder('league')
        .where('league.status != :status', {status: LeagueStatus.FINISHED})
        .getMany();

    console.log("leagues to process", leagues);

    const results = [];
    for (let l=0; l < leagues.length; l++) {
        const league = leagues[l];
        const res = await db.transaction(async (transactionalEntityManager) => {
            const marketPlayerRepository = transactionalEntityManager.getRepository(MarketPlayer);
            const marketBidRepository = transactionalEntityManager.getRepository(MarketBid);
            const playerRepository = transactionalEntityManager.getRepository(Player);

            const fromDate = moment().startOf('day').add(13, 'hours');
            const toDate = moment().startOf('day').add(1, 'day').add(11, 'hours');

            const alreadyCreated = await marketPlayerRepository.createQueryBuilder('market')
                .where('market.fromDate >= :f', {f: fromDate.toDate()})
                .andWhere('market.status = :s', {s: MarketPlayerStatus.OPEN})
                .andWhere('market.league.id = :l', {l: league.id})
                .getMany();

            console.log("already created", league.id, alreadyCreated);

            if (alreadyCreated.length < DAILY_PLAYERS) {
                for (let pos of allPositions) {
                    for (let i=0; i < NUM_PLAYERS_PER_POS; i++) {
                        // avg will be 30,40,50,60,70
                        const avg = (i * 10) + 30;
                        const std = 5;
                        const playerData = createPlayer(avg, std, pos);
                        const player = await playerRepository.save(playerData);

                        // Save market player
                        const marketPlayer = await marketPlayerRepository.save({
                            league: league,
                            player: player,
                            startingPrice: calculatePlayerPrice(player),
                            fromDate: fromDate.toDate(),
                            toDate: toDate.toDate(),
                            state: MarketPlayerStatus.OPEN
                        });

                        // Save ghost bid
                        await marketBidRepository.save({
                            league: league,
                            marketPlayer: marketPlayer,
                            amount: marketPlayer.startingPrice,
                            status: MarketBidStatus.PLACED,
                        });
                    }
                }
            }
            return true;
        });

        results.push({leagueId: league.id, ok: res});
    }

    return results;
}

