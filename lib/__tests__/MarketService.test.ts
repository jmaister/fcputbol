
import {describe, expect, it, test} from '@jest/globals';

import {createmarketplayers, resolvemarket, findAvailableMarketPlayers, sendBid} from '../MarketService';
import { createMinimalLeague } from './TestUtils';
import moment from 'moment';
import { constants, getBidEndTime } from 'lib/constants';

const now = new Date();
let context = null;

beforeAll(async () => {
    // League must be created before
    context = await createMinimalLeague();
})

test('Create market players', async () => {

    const response = await createmarketplayers(now);
    expect(response).not.toBeNull();
    for (let r of response) {
        expect(r.ok).toBe(true);
        expect(r.createdCount).toBeGreaterThan(0);
    }
});

test('Create market players again', async () => {

    const response = await createmarketplayers(now);
    expect(response).not.toBeNull();
    for (let r of response) {
        expect(r.ok).toBe(true);
        expect(r.createdCount).toBe(0);
    }
});


test('Resolve market', async () => {
    const response = await resolvemarket(now);
    expect(response).not.toBeNull();
    for (let r of response) {
        expect(r.ok).toBe(true);
        expect(r.resolvedCount).toBe(0);
    }
});

test('Resolve market, 0 bids', async () => {
    const future = moment(getBidEndTime()).add(1, 'day').toDate();

    const response = await resolvemarket(future);
    expect(response).not.toBeNull();
    for (let r of response) {
        expect(r.ok).toBe(true);
        expect(r.resolvedCount).toBe(constants.MARKET_DAILY_PLAYERS);
        expect(r.acceptedCount).toBe(0);
        expect(r.rejectedCount).toBe(0);
        expect(r.noBidsCount).toBe(constants.MARKET_DAILY_PLAYERS);
    }

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(0);

});

test('Create bid', async () => {
    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[0];
    expect(marketPlayer.bids.length).toBe(0);

    const bid = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid).not.toBeNull();
    expect(bid.ok).toBe(true);
});

test('Create bid, increase form other user', async () => {
    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[2];
    expect(marketPlayer.bids.length).toBe(0);

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u1.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);
});

test('Create bid, increase form same user', async () => {
    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[3];
    expect(marketPlayer.bids.length).toBe(0);

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u2.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);
});


test('Create bid, error low bid', async () => {
    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);
    const marketPlayer = marketPlayers[1];

    expect(marketPlayer.bids.length).toBe(0);

    const response = await sendBid(marketPlayer.startingPrice-1, marketPlayer.id, context.u2.id);
    expect(response.ok).toBe(false);
    expect(response.minBid).toBe(marketPlayer.startingPrice);

});

test('Create bid, error user not valid', async () => {
    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);
    const marketPlayer = marketPlayers[1];

    expect(marketPlayer.bids.length).toBe(0);

    const response = await sendBid(marketPlayer.startingPrice-1, marketPlayer.id, 999999);
    expect(response.ok).toBe(false);
});

test('Create bid, error market player not valid', async () => {
    const response = await sendBid(1, 9999999, context.u2.id);
    expect(response.ok).toBe(false);
});


test('Resolve market', async () => {
    const createResponse = await createmarketplayers(now);
    expect(createResponse).not.toBeNull();

    const marketPlayers = await findAvailableMarketPlayers(context.league.id);
    expect(marketPlayers.length).toBe(constants.MARKET_DAILY_PLAYERS);

    const marketPlayer = marketPlayers[4];

    const bid1 = await sendBid(marketPlayer.startingPrice, marketPlayer.id, context.u2.id);
    expect(bid1).not.toBeNull();
    expect(bid1.ok).toBe(true);

    const bid2 = await sendBid(marketPlayer.startingPrice + constants.MARKET_BID_INCREMENT, marketPlayer.id, context.u1.id);
    expect(bid2).not.toBeNull();
    expect(bid2.ok).toBe(true);


    const future = moment(getBidEndTime()).add(1, 'day').toDate();
    const response = await resolvemarket(future);
    expect(response).not.toBeNull();

    for (let r of response) {
        if (r.leagueId == context.league.id) {
            expect(r.ok).toBe(true);
            expect(r.resolvedCount).toBe(constants.MARKET_DAILY_PLAYERS);
            expect(r.acceptedCount).toBe(1);
            expect(r.rejectedCount).toBe(1);
            expect(r.noBidsCount).toBe(19);
        }
    }

});


export {}
