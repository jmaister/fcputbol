
import Database from 'db/database';
import { MarketPlayer, MarketBid, MarketPlayerStatus, MarketBidStatus } from 'db/entity/marketplayer.entity';
import { Player } from 'db/entity/player.entity';
import { createPlayer } from './playerUtilsServer';
import { allPositions, calculatePlayerPrice } from './playerUtils';
import { League, LeagueStatus } from 'db/entity/league.entity';
import { getBestBid, calculateNextPlayerNum, calculateNextBid } from './marketUtils';
import { User, UserMoney, UserMoneyType } from 'db/entity/user.entity';
import { constants, getBidStartingTime, getBidEndTime } from './constants';
import { Team } from 'db/entity/team.entity';
import { getUserMoney } from './UserService';
import { EntityManager } from 'typeorm';

export interface BidResult {
    ok: boolean
    message?: string
    minBid?: number
    errorCode?: string
}

export interface CreateMarketPlayersResult {
    leagueId: number,
    createdCount: number,
    ok: boolean,
}

export interface ResolvedMarketPlayersResult {
    leagueId: number,
    toBeResolvedCount?: number,
    acceptedCount?: number,
    rejectedCount?: number,
    noBidsCount?: number,
    ok: boolean,
    message?: string,
}

export async function findAvailableMarketPlayers(leagueId:number): Promise<MarketPlayer[]> {
    const db = await new Database().getManager();
    const marketPlayerRepository = db.getRepository(MarketPlayer);
    return marketPlayerRepository.createQueryBuilder('mp')
        .leftJoinAndSelect("mp.player", "player")
        .leftJoinAndSelect("mp.bids", "bids")
        .leftJoinAndSelect("bids.user", "user")
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

    const results = [];
    for (let l=0; l < leagues.length; l++) {
        const result = await createmarketplayersforleague(now, leagues[l].id, db);
        results.push(result);
    }

    return results;
}

export async function createmarketplayersforleague(now: Date, leagueId: number, db?: EntityManager): Promise<CreateMarketPlayersResult> {
    if (!db) {
        db = await new Database().getManager();
    }

    let createdCount = 0;
    const res = await db.transaction(async (transactionalEntityManager) => {
        const marketPlayerRepository = transactionalEntityManager.getRepository(MarketPlayer);
        const playerRepository = transactionalEntityManager.getRepository(Player);
        const leagueRepository = transactionalEntityManager.getRepository(League);

        const league = await leagueRepository.findOne(leagueId);
        if (!league) {
            return false;
        }

        const fromDate = getBidStartingTime();
        const toDate = getBidEndTime();

        const alreadyCreated = await marketPlayerRepository.createQueryBuilder('market')
            .where('market.fromDate >= :f', {f: fromDate})
            .andWhere('market.status = :s', {s: MarketPlayerStatus.OPEN})
            .andWhere('market.league.id = :l', {l: leagueId})
            .getMany();

        if (alreadyCreated.length < constants.MARKET_DAILY_PLAYERS) {
            for (let pos of allPositions) {
                for (let i=0; i < constants.MARKET_NEW_PLAYERS_PER_POS; i++) {
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
                        fromDate: fromDate,
                        toDate: toDate,
                        state: MarketPlayerStatus.OPEN
                    });
                    createdCount++;
                }
            }
        }
        return true;
    });

    return {leagueId: leagueId, ok: res, createdCount: createdCount};
}


export async function resolvemarket(now: Date): Promise<ResolvedMarketPlayersResult[]> {
    const db = await new Database().getManager();
    const leagueRepository = db.getRepository(League);
    const leagues = await leagueRepository.createQueryBuilder('league')
        .where('league.status != :status', {status: LeagueStatus.FINISHED})
        .getMany();

    const results:ResolvedMarketPlayersResult[] = [];
    for (let league of leagues) {
        const res = await resolvemarketforleague(now, league.id, db);
        results.push(res);
    }
    return results;
}

export async function resolvemarketforleague(now: Date, leagueId: number, db?: EntityManager): Promise<ResolvedMarketPlayersResult> {
    if (!db) {
        db = await new Database().getManager();
    }
    const res = await db.transaction(async (transactionalEntityManager) => {
        const marketPlayerRepository = transactionalEntityManager.getRepository(MarketPlayer);
        const marketBidRepository = transactionalEntityManager.getRepository(MarketBid);
        const playerRepository = transactionalEntityManager.getRepository(Player);
        const userRepository = transactionalEntityManager.getRepository(User);
        const teamRepository = transactionalEntityManager.getRepository(Team);
        const userMoneyRepository = transactionalEntityManager.getRepository(UserMoney);

        const fromDate = getBidStartingTime();
        const toDate = getBidEndTime();

        let acceptedCount = 0;
        let rejectedCount = 0;
        let noBidsCount = 0;

        const marketPlayesToResolve = await marketPlayerRepository.createQueryBuilder('market')
            .leftJoinAndSelect('market.player', 'player')
            .leftJoinAndSelect('player.team', 'team')
            .leftJoinAndSelect('team.user', 'user')
            .where('market.toDate <= :t', {t: now.toISOString()})
            .andWhere('market.status = :s', {s: MarketPlayerStatus.OPEN})
            .andWhere('market.league.id = :l', {l: leagueId})
            .getMany();


        for (let marketPlayer of marketPlayesToResolve) {
            const bids = await marketBidRepository.createQueryBuilder('bid')
                .leftJoinAndSelect('bid.team', 'team')
                .leftJoinAndSelect('bid.user', 'user')
                .where('bid.marketPlayer.id = :i', {i: marketPlayer.id})
                .andWhere('bid.status = :bs', {bs: MarketBidStatus.PLACED})
                .getMany();

            if (bids.length > 0) {
                const bestBid = getBestBid(bids);
                marketPlayer.status = MarketPlayerStatus.ACCEPTED;
                marketPlayer.resolvedDate = now;
                marketPlayer.finalPrice = bestBid.amount;
                await marketPlayerRepository.save(marketPlayer);

                for (let bid of bids) {
                    if (bid.id === bestBid.id) {
                        // Winner
                        bid.resolvedDate = now;
                        bid.status = MarketBidStatus.ACCEPTED;
                        await marketBidRepository.save(bid);

                        // Transfer player
                        const team = await teamRepository.findOne(bid.team.id, {relations: ["players"]});
                        const player = await playerRepository.findOne(marketPlayer.player.id);

                        player.team = bid.team;
                        player.num = calculateNextPlayerNum(team.players);
                        await playerRepository.save(player);

                        // TODO: remove player from current user's lineup
                        // TODO: send message to user to fix lineup, if needed

                        // Subtract money from buying user
                        await userMoneyRepository.save({
                            user: bid.user,
                            league: bid.league,
                            amount: -1 * bid.amount,
                            type: UserMoneyType.PLAYER_BUY,
                            player: marketPlayer.player,
                            date: new Date(),
                        });
                        // Add money from seller user
                        if (marketPlayer.player.team && marketPlayer.player.team.user) {
                            await userMoneyRepository.save({
                                user: marketPlayer.player.team.user,
                                league: bid.league,
                                amount: bid.amount,
                                type: UserMoneyType.PLAYER_SELL,
                                player: marketPlayer.player,
                                date: new Date(),
                            });
                        }

                        acceptedCount++;
                    } else {
                        // Losers
                        bid.resolvedDate = now;
                        bid.status = MarketBidStatus.REJECTED;
                        await marketBidRepository.save(bid);

                        rejectedCount++;
                    }
                }

            } else {
                // Finish the auction, no bids
                marketPlayer.status = MarketPlayerStatus.FINISHED;
                marketPlayer.resolvedDate = now;
                await marketPlayerRepository.save(marketPlayer);

                noBidsCount++;
            }
        }

        return {
            leagueId: leagueId,
            ok: true,
            toBeResolvedCount: marketPlayesToResolve.length,
            acceptedCount,
            rejectedCount,
            noBidsCount,
        } as ResolvedMarketPlayersResult;
    }).catch(error => {
        return {
            leagueId: leagueId,
            ok: false,
            message: error.message,
        } as ResolvedMarketPlayersResult;
    });

    return res;
}


export async function sendBid(bidPrice: number, marketPlayerId: number, userId: number): Promise<BidResult> {
    const db = await new Database().getManager();
    return await db.transaction(async (transactionalEntityManager) => {
        const marketPlayerRepository = transactionalEntityManager.getRepository(MarketPlayer);
        const marketBidRepository = transactionalEntityManager.getRepository(MarketBid);
        const userRepository = transactionalEntityManager.getRepository(User);

        const user = await userRepository.findOne(userId);
        if (!user) {
            return {
                ok: false,
                message: "El usuario no existe.",
            }
        }

        const marketPlayer = await marketPlayerRepository.findOne(marketPlayerId,
            {relations: ["league", "league.teams", "league.teams.user", "bids", "bids.user"]});
        if (!marketPlayer) {
            return {
                ok: false,
                message: "La puja no existe.",
            }
        } else if (marketPlayer.status != MarketPlayerStatus.OPEN) {
            return {
                ok: false,
                message: "La puja ya está cerrada.",
            }
        }

        // Get user money
        const userMoney = await getUserMoney(userId, marketPlayer.league.id, db);
        // Check user money
        if (bidPrice > userMoney.expendable) {
            return {
                ok: false,
                message: "No tienes suficiente presupuesto. Máximo: " + userMoney.expendable,
                errorCode: 'NOT_ENOUGH_BUDGET'
            }
        }

        // Check if the player can bid to this MarketPlayer
        let isTeamFound = false;
        let userTeam = null
        for (let team of marketPlayer.league.teams) {
            if (team.user.id === userId) {
                isTeamFound = true;
                userTeam = team;
            }
        }

        if (!isTeamFound) {
            return {
                ok: false,
                message: "El equipo es incorrecto.",
            }
        }

        const bestBid = getBestBid(marketPlayer.bids);
        const minBid = calculateNextBid(bestBid, marketPlayer.startingPrice);
        if (bidPrice >= minBid) {
            // Overbid previous bids from this user
            await marketBidRepository.createQueryBuilder()
                .update(MarketBid)
                .set({
                    status: MarketBidStatus.OVERBID,
                    resolvedDate: new Date(),
                })
                .where("status = :s", {s: MarketBidStatus.PLACED})
                .andWhere("user.id = :u", {u: userId})
                .andWhere("marketPlayer.id = :mp", {mp: marketPlayerId})
                .execute();

            // Create new bid
            await marketBidRepository.save({
                marketPlayer,
                league: marketPlayer.league,
                user,
                team: userTeam,
                amount: bidPrice,
                status: MarketBidStatus.PLACED,
            });
            return {
                ok: true,
            }
        } else {
            return {
                ok: false,
                message: "Tu puja debe ser de " + minBid + " o mayor.",
                minBid: minBid,
            }
        }
    });
}
