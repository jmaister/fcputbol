
import {describe, expect, it, test} from '@jest/globals';
import { createPlayerData } from 'lib/playerUtilsServer';
import { Positions, PlayerStat, PlayerStatList, Player } from 'db/entity/player.entity';
import { savePlayer, saveNewStatPoint, findPlayer } from 'lib/PlayerService';
import { AssertionError } from 'assert';


test('Create new player stats', async () => {

    const playerData = createPlayerData(20, 5, Positions.def);
    const savedPlayer = await savePlayer(playerData);

    expect(savedPlayer.defense).toBe(playerData.defense);
    expect(savedPlayer.save).toBe(playerData.save);
    expect(savedPlayer.pass).toBe(playerData.pass);
    expect(savedPlayer.dribble).toBe(playerData.dribble);
    expect(savedPlayer.shot).toBe(playerData.shot);

});

test('Update Player stat', async () => {

    const playerData = {
        name: 'a',
        surname: 'b',
        position: Positions.def,
        defense: 1,
        dribble: 2,
        pass: 3,
        save: 4,
        shot: 5,
    } as Player;
    const savedPlayer = await savePlayer(playerData);

    expect(savedPlayer.defense).toBe(playerData.defense);
    expect(savedPlayer.save).toBe(playerData.save);
    expect(savedPlayer.pass).toBe(playerData.pass);
    expect(savedPlayer.dribble).toBe(playerData.dribble);
    expect(savedPlayer.shot).toBe(playerData.shot);

    const inc = 100;
    for (const stat of PlayerStatList) {
        const updatedPlayer = await saveNewStatPoint(savedPlayer, inc, stat);
        expect(updatedPlayer).not.toBeNull();
        expect(updatedPlayer[stat.toLowerCase()]).toBe(playerData[stat.toLowerCase()] + inc);
        expect(updatedPlayer[stat.toLowerCase()]).toBe(savedPlayer[stat.toLowerCase()] + inc);
    }

});


export {}
