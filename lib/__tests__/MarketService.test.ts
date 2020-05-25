
import {describe, expect, it, test} from '@jest/globals';

import {createmarketplayers} from '../MarketService';


test('title', async () => {
    const now = new Date();

    const response = await createmarketplayers(now);
    expect(response).not.toBeNull();
});


export {}
