
import {describe, expect, it, test} from '@jest/globals';
import { createMinimalLeague } from './TestUtils';
import { createSeason, findSeason } from 'lib/SeasonService';
import { SeasonStatus } from 'db/entity/season.entity';
import { RoundStatus } from 'db/entity/round.entity';
import { getUserMoney } from 'lib/UserService';
import { constants } from 'lib/constants';



test('Create season', async () => {
    const context = await createMinimalLeague();

    const currentMoneyU1 = await getUserMoney(context.u1.id, context.league.id);
    expect(currentMoneyU1.money).toBe(0);
    const currentMoneyU2 = await getUserMoney(context.u2.id, context.league.id);
    expect(currentMoneyU2.money).toBe(0);

    const savedSeason = await createSeason({
        name: "Season " + Math.random(),
        leagueId: context.league.id,
        userId: context.u1.id
    });
    expect(savedSeason).not.toBeNull();

    const season = await findSeason(savedSeason.id);
    expect(season).not.toBeNull();
    expect(season.league.id).toBe(context.league.id);
    expect(season.roundCount).toBe(2);
    expect(season.rounds.length).toBe(2);
    for (let round of season.rounds) {
        expect(round.status).toBe(RoundStatus.SCHEDULED);
    }
    expect(season.currentRound).toBe(0);
    expect(season.seasonNumber).toBe(0);
    expect(season.status).toBe(SeasonStatus.SCHEDULED);
    expect(season.classifications.length).toBe(2);

    const afterMoneyU1 = await getUserMoney(context.u1.id, context.league.id);
    expect(afterMoneyU1.money).toBe(constants.MONEY_SEASON_START);
    const aftertMoneyU2 = await getUserMoney(context.u2.id, context.league.id);
    expect(aftertMoneyU2.money).toBe(constants.MONEY_SEASON_START);

});

test('Create season, error no admin', async () => {
    const context = await createMinimalLeague();

    return expect(async () => {
        return await createSeason({
            name: "Season " + Math.random(),
            leagueId: context.league.id,
            userId: context.u2.id
        });
    }).rejects.toThrow();
});

test('Create season, error while current season is running', async () => {
    const context = await createMinimalLeague();

    const savedSeason = await createSeason({
        name: "Season " + Math.random(),
        leagueId: context.league.id,
        userId: context.u1.id
    });
    expect(savedSeason).not.toBeNull();

    return expect(async () => {
        return await createSeason({
            name: "Season " + Math.random(),
            leagueId: context.league.id,
            userId: context.u1.id
        });
    }).rejects.toThrow();
});


export {}
