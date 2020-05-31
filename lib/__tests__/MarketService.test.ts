
import {describe, expect, it, test} from '@jest/globals';

import {createmarketplayers, resolvemarket, findAvailableMarketPlayers, sendBid, createmarketplayersforleague, resolvemarketforleague} from '../MarketService';
import { createMinimalLeague } from './TestUtils';
import moment from 'moment';
import { constants, getBidEndTime } from 'lib/constants';
import { createUserMoney } from 'lib/UserService';
import { UserMoneyType } from 'db/entity/user.entity';

const now = new Date();

test('Create market players', async () => {
    const context = await createMinimalLeague();

    const response = await createmarketplayersforleague(now, context.league.id);
    expect(response).not.toBeNull();
    expect(response.ok).toBe(true);
    expect(response.createdCount).toBe(constants.MARKET_DAILY_PLAYERS);
});

test('Create market players again', async () => {
    const context = await createMinimalLeague();

    const response = await createmarketplayersforleague(now, context.league.id);
    expect(response).not.toBeNull();
    expect(response.ok).toBe(true);
    expect(response.createdCount).toBe(constants.MARKET_DAILY_PLAYERS);

    const response2 = await createmarketplayersforleague(now, context.league.id);
    expect(response2).not.toBeNull();
    expect(response2.ok).toBe(true);
    expect(response2.createdCount).toBe(0);
});


test('Resolve market, all empty', async () => {
    const context = await createMinimalLeague();

    const response = await resolvemarketforleague(now, context.league.id);
    expect(response).not.toBeNull();
    expect(response.ok).toBe(true);
    expect(response.toBeResolvedCount).toBe(0);
    expect(response.acceptedCount).toBe(0);
    expect(response.rejectedCount).toBe(0);
    expect(response.noBidsCount).toBe(0);
});

test('Resolve market, 0 bids', async () => {
    const context = await createMinimalLeague();
    const future = moment(getBidEndTime()).add(1, 'day').toDate();

    const response = await resolvemarketforleague(future, context.league.id);
    expect(response).not.toBeNull();
    expect(response.ok).toBe(true);
    expect(response.toBeResolvedCount).toBe(0);
    expect(response.acceptedCount).toBe(0);
    expect(response.rejectedCount).toBe(0);
    expect(response.noBidsCount).toBe(0);

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(0);

});

test('Create bid, error no money', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[0];
    expect(marketPlayer.bids.length).toBe(0);

    const bid = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid).not.toBeNull();
    expect(bid.ok).toBe(false);
    expect(bid.errorCode).toBe("NOT_ENOUGH_BUDGET");
});

test('Create bid', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[0];
    expect(marketPlayer.bids.length).toBe(0);

    // Get money to the user
    await createUserMoney(context.u2.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);

    const bid = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid).not.toBeNull();
    expect(bid.ok).toBe(true);
});

test('Create bid, increase form other user', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[2];
    expect(marketPlayer.bids.length).toBe(0);

    // Get money to the users
    await createUserMoney(context.u1.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);
    await createUserMoney(context.u2.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u1.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);
});

test('Create bid, increase form same user', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[3];
    expect(marketPlayer.bids.length).toBe(0);

    // Get money to the user
    await createUserMoney(context.u2.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    // TODO: should check the money without counting the previous vid
    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u2.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);
});


test('Create bid, error low bid', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);
    const marketPlayer = marketPlayers[1];

    expect(marketPlayer.bids.length).toBe(0);

    // Get money to the user
    await createUserMoney(context.u2.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);

    const response = await sendBid(marketPlayer.startingPrice-1, marketPlayer.id, context.u2.id);
    expect(response.ok).toBe(false);
    expect(response.minBid).toBe(marketPlayer.startingPrice);

});

test('Create bid, error user not valid', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);
    const marketPlayer = marketPlayers[1];

    expect(marketPlayer.bids.length).toBe(0);

    const response = await sendBid(marketPlayer.startingPrice-1, marketPlayer.id, 999999);
    expect(response.ok).toBe(false);
});

test('Create bid, error market player not valid', async () => {
    const context = await createMinimalLeague();

    const response = await sendBid(1, 9999999, context.u2.id);
    expect(response.ok).toBe(false);
});


test('Resolve market', async () => {
    const context = await createMinimalLeague();

    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[4];

    // Get money to the user
    await createUserMoney(context.u1.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);
    await createUserMoney(context.u2.id, context.league.id, marketPlayer.startingPrice * 10, UserMoneyType.SEASON_START);

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u1.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);


    const future = moment(getBidEndTime()).add(1, 'day').toDate();
    const response = await resolvemarketforleague(future, context.league.id);
    expect(response).not.toBeNull();

    expect(response.ok).toBe(true);
    expect(response.toBeResolvedCount).toBe(constants.MARKET_DAILY_PLAYERS);
    expect(response.acceptedCount).toBe(1);
    expect(response.rejectedCount).toBe(1);
    expect(response.noBidsCount).toBe(19);

});


export {}
