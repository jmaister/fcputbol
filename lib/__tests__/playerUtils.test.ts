


import {describe, expect, it, test} from '@jest/globals';
import { Player } from 'db/entity/player.entity';
import { calculatePlayerPrice, calculatePlayerStats } from 'lib/playerUtils';


test("Calculate player stats", () => {
    const player = {
        defense: 1,
        dribble: 1,
        pass: 1,
        shot: 1,
        save: 1
    } as Player;

    const stats = calculatePlayerStats(player);
    expect(stats.avg).toBe(1);
    expect(stats.max).toBe(1);
    expect(stats.min).toBe(1);
    expect(stats.sum).toBe(5);
});

test("Calculate player price", () => {
    const player = {
        defense: 1,
        dribble: 1,
        pass: 1,
        shot: 1,
        save: 1
    } as Player;

    const price = calculatePlayerPrice(player);
    expect(price).toBe(15000);
});

export {}
