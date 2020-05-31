import { constants } from "./constants";

import { MarketBid, MarketBidStatus } from "db/entity/marketplayer.entity";
import { Player } from "db/entity/player.entity";


export function getBestBid(bids: MarketBid[]): MarketBid {
    let best = null;

    for (let bid of bids) {
        if (best == null || (bid.amount > best.amount && bid.status == MarketBidStatus.PLACED)) {
            best = bid;
        }
    }

    return best;
}

export function calculateNextBid(bid:MarketBid, playerPrice:number): number {
    if (bid) {
        return bid.amount + constants.MARKET_BID_INCREMENT;
    } else {
        return playerPrice;
    }
}


export function calculateNextPlayerNum(players: Player[]): number {
    let num = 0;
    for (let p of players) {
        if (p.num > num) {
            num = p.num;
        }
    }
    return num + 1;
}
