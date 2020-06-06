
import {describe, expect, it, test} from '@jest/globals';
import { createPlayerData } from 'lib/playerUtilsServer';
import { Positions, PlayerStat, PlayerStatList, Player } from 'db/entity/player.entity';
import { savePlayer, saveNewStatPoint, findPlayer } from 'lib/PlayerService';
import { createMinimalLeague } from './TestUtils';
import { createUserAsset } from 'lib/UserService';
import { UserAssetType, UserAssetSubType } from 'db/entity/user.entity';


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

    const context = await createMinimalLeague();

    const playerData = context.t1.players[0];

    // Give the user enough points
    await createUserAsset(context.u1.id, context.league.id, 10000, UserAssetType.PLAYER_POINTS, UserAssetSubType.SEASON_START);

    const inc = 100;
    for (const stat of PlayerStatList) {
        const updatedPlayer = await saveNewStatPoint(context.league.id, context.u1.id, playerData, inc, stat);
        expect(updatedPlayer).not.toBeNull();
        expect(updatedPlayer[stat.toLowerCase()]).toBe(playerData[stat.toLowerCase()] + inc);
    }
});

test('Update Player stat, error not enough points', async () => {

    const context = await createMinimalLeague();

    const playerData = context.t1.players[0];

    return expect(async () => {
        return await saveNewStatPoint(context.league.id, context.u1.id, playerData, 1, PlayerStat.DEFENSE);
    }).rejects.toThrow();
});


export {}
