
import {describe, expect, it, test} from '@jest/globals';

import {createmarketplayers} from '../MarketService';


test('title', async () => {
    expect(2+2).toBe(4);

    const now = new Date();

    const response = await createmarketplayers(now);
    expect(response).not.toBeNull();
});


export {}
