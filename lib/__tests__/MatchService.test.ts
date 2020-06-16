
import { describe, expect, it, test } from '@jest/globals';
import { createLeagueAndSeason } from './TestUtils';
import { freezeLineupsForLeague } from 'lib/MatchService';
import moment from 'moment';
import { MatchStatus } from 'db/entity/match.entity';


const now = new Date();

test('Freeze Lineups', async () => {
    const context = await createLeagueAndSeason();

    let freezeDate = context.season.rounds[context.season.currentRound].freezeLineupDate;
    freezeDate = moment(freezeDate).add(1, 'second').toDate();

    const matches = await freezeLineupsForLeague(freezeDate, context.league.id);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(1);
    for (let match of matches) {
        expect(match.status).toBe(MatchStatus.READY);
        expect(match.homeLineup).not.toBeNull();
        expect(match.awayLineup).not.toBeNull();
        expect(match.matchSteps).toBeUndefined();
    }
});

export { }
