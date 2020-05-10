
import {shuffle} from './utils';

// https://www.devenezia.com/javascript/article.php/RoundRobin3.html
export function tournament(n) {
    const rounds = [];

    for (var r = 1; r < n; r++) {
        rounds.push(Round(r, n, false));
    }
    for (var r = 1; r < n; r++) {
        rounds.push(Round(r, n, true));
    }
    return shuffle(rounds);
}

export function Round(r, n, reverse) {
    const pairs = [];

    for (let i = 1; i <= n / 2; i++) {
        if (i == 1) {
            pairs.push(new MatchPair(1, (r + n - i - 1) % (n - 1) + 2, reverse))
        } else {
            pairs.push(new MatchPair((r + i - 2) % (n - 1) + 2, (r + n - i - 1) % (n - 1) + 2, reverse))
        }
    }
    return pairs;
}

export class MatchPair {
    home: any
    away: any

    constructor(home, away, reverse) {
        if (reverse) {
            this.home = away;
            this.away = home;
        } else {
            this.home = home;
            this.away = away;
        }
    }
}
