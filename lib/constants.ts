import moment from 'moment';


export const constants = {
    MARKET_BID_INCREMENT: 1000,
    MARKET_NEW_PLAYERS_PER_POS: 5,
    MARKET_DAILY_PLAYERS: 20

};

export function getBidStartingTime(): Date {
    return moment().startOf('day').add(13, 'hours').toDate();
}

export function getBidEndTime(): Date {
    return moment().startOf('day').add(1, 'day').add(11, 'hours').toDate();;
}
