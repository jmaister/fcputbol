import { MarketBid } from "db/entity/marketplayer.entity";
import { constants } from "./constants";


export function getBestBid(bids: MarketBid[]): MarketBid {
    let best = null;

    for (let bid of bids) {
        if (best == null || bid.amount > best.amount) {
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
