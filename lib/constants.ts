import moment from 'moment';


export const constants = {
    MARKET_BID_INCREMENT: 1000,
    MARKET_NEW_PLAYERS_PER_POS: 5,
    MARKET_DAILY_PLAYERS: 20,

    MONEY_SEASON_START: 500000,
    MONEY_OVERSPEND_PCT: 15,

    MONEY_MATCH_WIN: 50000,
    MONEY_MATCH_DRAW: 25000,
    MONEY_MATCH_LOSE: 10000,
    MONEY_PER_GOAL: 10000,

    PLAYER_POINTS_SEASON_START: 20,

};

export function getBidStartingTime(): Date {
    return moment().startOf('day').add(13, 'hours').toDate();
}

export function getBidEndTime(): Date {
    return moment().startOf('day').add(1, 'day').add(11, 'hours').toDate();;
}
