
import {describe, expect, it, test} from '@jest/globals';

import {createmarketplayers} from '../MarketService';
import { creteMinimalLeaue } from './TestUtils';

const now = new Date();
let context = null;

beforeAll(async () => {
    // League must be created before
    context = await creteMinimalLeaue();
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




export {}
