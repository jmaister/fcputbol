
import {describe, expect, it, test} from '@jest/globals';
import { createLeagueAndSeason } from './TestUtils';
import moment from 'moment';
import { freezeLineupsForLeague } from 'lib/MatchService';
import { playRound, RoundProcessInfo } from 'lib/RoundService';
import { Round } from 'db/entity/round.entity';


test('Play Round', async () => {
    const context = await createLeagueAndSeason();

    const currentRound = context.season.rounds[context.season.currentRound];

    let freezeDate = moment(currentRound.freezeLineupDate).add(1, 'second').toDate();
    await freezeLineupsForLeague(freezeDate, context.league.id);

    let playDate = currentRound.roundDate;
    playDate = moment(playDate).add(1, 'second').toDate();

    const response = await playRound(playDate, currentRound.id);
    expect(response).not.toBeNull();
    expect(response.roundId).toBe(currentRound.id);
    expect(response.errorCount).toBe(0);
    expect(response.matchesToProcess).toBe(1);
    expect(response.processedMatches).toBe(1);
    expect(response.roundFinished).toBe(true);
});


async function testFreezeAndPlayRound(round:Round, leagueId:number): Promise<RoundProcessInfo> {
    let freezeDate0 = moment(round.freezeLineupDate).add(1, 'second').toDate();
    await freezeLineupsForLeague(freezeDate0, leagueId);

    let playDate0 = moment(round.roundDate).add(1, 'second').toDate();
    return await playRound(playDate0, round.id);
}

test('Play Round, finish season', async () => {
    const context = await createLeagueAndSeason();

    const round0 = context.season.rounds[0];

    const response0 = await testFreezeAndPlayRound(round0, context.league.id);
    expect(response0).not.toBeNull();
    expect(response0.roundId).toBe(round0.id);
    expect(response0.errorCount).toBe(0);
    expect(response0.matchesToProcess).toBe(1);
    expect(response0.processedMatches).toBe(1);
    expect(response0.roundFinished).toBe(true);
    expect(response0.seasonFinished).toBe(false);

    const round1 = context.season.rounds[1];

    const response1 = await testFreezeAndPlayRound(round1, context.league.id);
    expect(response1).not.toBeNull();
    expect(response1.roundId).toBe(round1.id);
    expect(response1.errorCount).toBe(0);
    expect(response1.matchesToProcess).toBe(1);
    expect(response1.processedMatches).toBe(1);
    expect(response1.roundFinished).toBe(true);
    expect(response1.seasonFinished).toBe(true);

});

export {}
