import { Player } from "db/entity/player.entity";
import { Team } from "db/entity/team.entity";
import { randomDoubleInterval, randomElement } from "lib/utils";
import { MatchStep } from "db/entity/match.entity";

export interface Formation {
    gk: Player[]
    def: Player[]
    mid: Player[]
    fw: Player[]
}

export interface MatchResult {
    steps: MatchStep[]
    score: number[]
}

function teamToFormation(team:Team) : Formation {
    const formation = {
        gk: [],
        def: [],
        mid: [],
        fw: []
    } as Formation;

    const lineup = team.currentLineup;
    for (let i=0; i < lineup.players.length; i++) {
        let pl = lineup.players[i];
        formation[pl.position].push(pl);
    }

    return formation;
}

export function play(home: Team, away: Team) {
    const formationHome = teamToFormation(home);
    const formationAway = teamToFormation(away);

    return playFunction(formationHome, formationAway);
}

const HANDICAP = {
    "M":  {a: 0.5, b:0.5},
    "DA": {a: 0.6, b:0.4},
    "PA": {a: 0.9, b:0.1},
    "DB": {a: 0.4, b:0.6},
    "PB": {a: 0.1, b:0.9},
};

const calcProbs = (p) => {
    const max = 1.0 * Object.keys(p)
        .map(key => {
            return p[key];
        })
        .reduce((a, b) => a + b, 0);

    let acc = 0;
    const probs = Object.keys(p).map(e => {
        const own = p[e] / max;
        acc = acc + own;
        return {
            action: e,
            own: p[e] / max,
            acc: acc
        };
    });
    return probs;
};


const randomSelectProb = (probs) => {
   const rnd = randomDoubleInterval(0, 1);
   for (let i=0; i<probs.length; i++) {
       const p = probs[i];
       if (rnd <= p.acc) {
           return p.action;
       }
   }
};

const calcStepsMedMed = (playerWithBall:Player, plsatt:Player[], statatt:string, plsdef:Player[], stattdef:string, plsTarget:Player[], state:string, stateTarget:string, ballOnA:boolean, stepNumber:number, t:number) : MatchStep[] => {
    // TODO: calculate depending on number of players on each side

    const probs = {};

    // Prob pase
    const attackPlayer = playerWithBall;
    probs["pase"] = attackPlayer[statatt];
    // Probs regate
    plsdef.forEach((pl, i) => {
        // TODO: should be weighted by number of players
        probs[i] = pl[stattdef];
    });

    const pctProbs = calcProbs(probs);
    const selected = randomSelectProb(pctProbs);

    const steps = [] as MatchStep[];
    if (selected === "pase") {
        const receiver = randomElement(plsTarget);
        steps.push({
            player: attackPlayer,
            player2: receiver,
            comment: "{player} pasa el balón",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        steps.push({
            player: receiver,
            comment: "{player} recibe el pase",
            state: stateTarget,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);
    } else {
        const defPlayerIdx = parseInt(selected);
        const defPlayer = plsdef[defPlayerIdx];

        steps.push({
            player: attackPlayer,
            player2: defPlayer,
            comment: "{player} regatea con {player2}",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        const step2probs = {
            "regate": attackPlayer.dribble,
            "robo": defPlayer.dribble
        };
        const pctProbs = calcProbs(step2probs);
        const selected2 = randomSelectProb(pctProbs);
        if (selected2 === "regate") {
            steps.push({
                player: attackPlayer,
                player2: defPlayer,
                comment: "{player} se desmarca y consigue pasar el balón",
                state: state,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);

            let receiver = randomElement(plsTarget);

            steps.push({
                player: receiver,
                player2: attackPlayer,
                comment: "{player} recibe el pase",
                state: stateTarget,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        } else if (selected2 === "robo") {
            steps.push({
                player: defPlayer,
                player2: attackPlayer,
                comment: "{player} roba el balón",
                state: state,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        }
    }

    return steps;
};

const calcStepsDelDef = (playerWithBall:Player, plsatt: Player[], statatt:string, plsdef: Player[], stattdef:string, plsTarget: Player[], state:string, stateTarget:string, ballOnA:boolean, stepNumber:number, t:number): MatchStep[] => {
    // TODO: calculate depending on number of players on each side

    const probs = {};

    // Prob pase
    const platt = playerWithBall;
    probs["escapa"] = platt[statatt] * HANDICAP[state][ballOnA?'a':'b'];
    // Probs regate
    plsdef.forEach((pl, i) => {
        // TODO: should be weighted by number of players
        probs[i] = pl[stattdef] * HANDICAP[state][ballOnA?'b':'a'];
    });

    const pctProbs = calcProbs(probs);
    const selected = randomSelectProb(pctProbs);

    const steps = [] as MatchStep[];
    if (selected === "escapa") {
        steps.push({
            player: platt,
            comment: "{player} sortea a la defensa",
            state: stateTarget,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);
    } else {
        const defPlayerIdx = parseInt(selected);
        const defPlayer = plsdef[defPlayerIdx];

        steps.push({
            player: platt,
            player2: defPlayer,
            comment: "{player} regatea con {player2}",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        const step2probs = {
            "regate": platt.dribble,
            "robo": defPlayer.dribble
        };
        const pctProbs = calcProbs(step2probs);
        const selected2 = randomSelectProb(pctProbs);
        if (selected2 === "regate") {
            steps.push({
                player: platt,
                comment: "{player} se desmarca y consigue atravesar la defensa",
                state: stateTarget,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);

        } else if (selected2 === "robo") {
            steps.push({
                player: defPlayer,
                comment: "{player} roba el balón y despeja.",
                state: state,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
            steps.push({
                player: randomElement(plsTarget),
                comment: "{player} recibe el pase del defensa.",
                state: "M",
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        }
    }

    return steps;
};


const calcStepsDefDel = (playerWithBall:Player, plsdel: Player[], plsTarget: Player[], state:string, stateTargetMed:string, stateTargetDel:string, ballOnA:boolean, stepNumber:number, t:number): MatchStep[] => {

    const probs = {};

    // Prob pase, HANDICAP inverted as its deffensive
    probs["despeja"] = playerWithBall.pass * HANDICAP[state][ballOnA?'b':'a'];
    probs["regate"] = playerWithBall.dribble * HANDICAP[state][ballOnA?'b':'a'];

    const pctProbs = calcProbs(probs);
    const selected = randomSelectProb(pctProbs);

    const steps = [] as MatchStep[];
    if (selected === "despeja") {
        steps.push({
            player: playerWithBall,
            comment: "{player} despeja el balón",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);
        const med = randomElement(plsTarget);
        steps.push({
            player: med,
            comment: "{player} recibe el pase del defensa",
            state: stateTargetMed,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);
    } else if (selected === "regate"){
        // TODO: select DEL depending on number of players
        const del = randomElement(plsdel);

        steps.push({
            player: playerWithBall,
            player2: del,
            comment: "{player} se encuentra con {player2}",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        const step2probs = {
            "regate": playerWithBall.dribble,
            "robo": del.dribble
        };
        const pctProbs = calcProbs(step2probs);
        const selected2 = randomSelectProb(pctProbs);
        if (selected2 === "regate") {
            const med = randomElement(plsTarget);
            steps.push({
                player: playerWithBall,
                comment: "{player} regatea y consigue pasar el balón",
                state: state,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
             steps.push({
                player: med,
                comment: "{player} recibe el pase del defensa",
                state: stateTargetMed,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);

        } else if (selected2 === "robo") {
            steps.push({
                player: del,
                comment: "{player} roba el balón y encara a portería.",
                state: stateTargetDel,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        }
    }

    return steps;
};

const calcStepsDelPor = (del: Player, por: Player, plsTarget: Player[], state:string, stateGoal:string, stateClear:string, ballOnA:boolean, stepNumber:number, t:number): MatchStep[] => {
    const probs = {};

    // Prob regate al portero
    probs["regate"] = del.dribble;
    // Prob tiro
    probs["tiro"] = del.shot;

    const pctProbs = calcProbs(probs);
    const selected = randomSelectProb(pctProbs);

    const steps = [] as MatchStep[];
    if (selected === "regate") {
        steps.push({
            player: del,
            player2: por,
            comment: "{player} intenta regatear al portero.",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        const probs2 = {};
        // Prob regate y gol
        probs2["regate"] = del.dribble * HANDICAP[state][ballOnA?'a':'b'];
        // Prob portero para
        probs2["intercepta"] = (por.dribble + por.save) * HANDICAP[state][ballOnA?'b':'a'];

        const pctProbs2 = calcProbs(probs2);
        const selected2 = randomSelectProb(pctProbs2);

        if (selected2 === "regate") {
            steps.push({
                player: del,
                player2: por,
                comment: "{player} regatea al portero y GOL!",
                state: stateGoal,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        } else if (selected2 === "intercepta") {
            steps.push({
                player: por,
                comment: "{player} intercepta el balón y despeja.",
                state: state,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
            steps.push({
                player: randomElement(plsTarget),
                player2: por,
                comment: "{player} recibe el pase del portero.",
                state: stateClear,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        }

    } else if (selected === "tiro") {
        steps.push({
            player: del,
            player2: por,
            comment: "{player} se prepara para tirar a portería.",
            state: state,
            ballOnA: ballOnA,
            stepNumber: stepNumber++,
            t: t
        } as MatchStep);

        const probs2 = {};
        // Prob regate y gol
        probs2["tiro"] = del.shot * 0.5;
        // Prob portero para
        probs2["parada"] = por.save;

        const pctProbs2 = calcProbs(probs2);
        const selected2 = randomSelectProb(pctProbs2);

        if (selected2 === "tiro") {
            steps.push({
                player: del,
                comment: "{player} tira y GOL!",
                state: stateGoal,
                ballOnA: ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        } else if (selected2 === "parada") {
            steps.push({
                player: por,
                comment: "{player} hace una parada.",
                state: state,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
            const def = randomElement(plsTarget);
            steps.push({
                player: por,
                player2: def,
                comment: "{player} pasa el balón a la defensa.",
                state: state,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
            steps.push({
                player: def,
                comment: "{player} recibe el pase del portero.",
                state: stateClear,
                ballOnA: !ballOnA,
                stepNumber: stepNumber++,
                t: t
            } as MatchStep);
        }
    }

    return steps;
};

const calcKickOff = (pls: Player[], isFirstPartStart:boolean, isSecondPartStart:boolean, ballOnA:boolean, stepNumber:number, t:number): MatchStep[] => {
    const newSteps = [] as MatchStep[];
    let comment:string = null;
    if (isFirstPartStart) {
        comment = "{player} recibe el saque inicial.";
    } else if (isSecondPartStart) {
        comment = "{player} inicial el segundo tiempo.";
        ballOnA = false;
    } else {
        comment = "{player} saca desde el centro del campo después del gol.";
        ballOnA = !ballOnA;
    }

    let currentPlayer = randomElement(pls);

    newSteps.push({
        player: currentPlayer,
        comment: comment,
        state: "M",
        ballOnA: ballOnA,
        stepNumber: stepNumber++,
        t: t
    } as MatchStep);

    return newSteps;
};

const playFunction = (ala:Formation, alb:Formation): MatchResult => {
    const stps = [] as MatchStep[];
    const score = [0, 0] as number[];

    let state:string = "M";
    let ballOnA:boolean = true;
    let stepNumber:number = 0;
    let t:number = 0;

    calcKickOff(ala.mid, true, false, ballOnA, stepNumber, t).forEach(e=>stps.push(e));

    const MAX_TIME = 90;

    while (t < MAX_TIME) {

        const previous = stps[stps.length-1];
        const playerWithBall = previous.player;
        state = previous.state;
        ballOnA = previous.ballOnA;
        t = previous.t + 1;
        stepNumber = previous.stepNumber + 1;

        if (t == 46) {
            // Half time
            stps.push({
                comment: "Fin del primer tiempo.",
                t: t,
                stepNumber: stepNumber++
            } as MatchStep);
            stps.push({
                comment: "Comienza el segundo tiempo.",
                t: t,
                stepNumber: stepNumber++
            } as MatchStep);
            calcKickOff(alb.mid, false, true, ballOnA, stepNumber, t).forEach(e=>stps.push(e));
        }


        let newSteps:MatchStep[] = null;
        if (state === "M") {
            if (ballOnA) {
                newSteps = calcStepsMedMed(playerWithBall, ala.mid, "pass", alb.mid, "pass", ala.fw, "M", "DB", ballOnA, stepNumber, t);
            } else {
                newSteps = calcStepsMedMed(playerWithBall, alb.mid, "pass", ala.mid, "pass", alb.fw, "M", "DA", ballOnA, stepNumber, t);
            }

        } else if (state === "DB") {
            if (ballOnA) {
                newSteps = calcStepsDelDef(playerWithBall, ala.fw, "dribble", alb.def, "defense", alb.mid, "DB", "PB", ballOnA, stepNumber, t);
            } else {
                newSteps = calcStepsDefDel(playerWithBall, ala.fw, alb.mid, state, "M", "DB", ballOnA, stepNumber, t);
            }
        } else if (state === "DA") {
            if (ballOnA) {
                newSteps = calcStepsDefDel(playerWithBall, alb.fw, ala.mid, state, "M", "DA", ballOnA, stepNumber, t);
            } else {
                newSteps = calcStepsDelDef(playerWithBall, alb.fw, "dribble", ala.def, "defense", ala.mid, "DA", "PA", ballOnA, stepNumber, t);
            }

        } else if (state === "PB") {
            newSteps = calcStepsDelPor(playerWithBall, alb.gk[0], alb.def, "PB", "GA", "DB", ballOnA, stepNumber, t);
        } else if (state === "PA") {
            newSteps = calcStepsDelPor(playerWithBall, ala.gk[0], ala.def, "PA", "GB", "DA", ballOnA, stepNumber, t);

        } else if (state === "GA") {
            newSteps = calcKickOff(alb.mid, false, false, ballOnA, stepNumber, t);
            score[0]++;
        } else if (state === "GB") {
            newSteps = calcKickOff(ala.mid, false, false, ballOnA, stepNumber, t);
            score[1]++;
        } else {
            throw new Error("wrong state:"+state);
        }
        newSteps.forEach(e=>stps.push(e));

    }

    // End of the match
    const previous = stps[stps.length-1];
    stps.push({
        comment: "Fin del partido.",
        t: previous.t,
        stepNumber: previous.stepNumber + 1
    } as MatchStep);

    // Set current goals on steps
    let homeGoals = 0;
    let awayGoals = 0;
    stps.forEach(s => {
        if (s.state === 'GA') {
            homeGoals++;
        } else if (s.state === 'GB') {
            awayGoals++;
        }
        s.currentGoalHome = homeGoals;
        s.currentGoalAway = awayGoals;
    });

    return {
        steps: stps,
        score: score
    } as MatchResult;
};

/*
const format = (s, args) => {
    var formatted = s;
    for (let arg in args) {
        formatted = formatted.replace("{" + arg + "}", "<b>" + args[arg] + "</b>");
    }
    return formatted;
};


const matchResult = playFunction(alinA, alinB);
console.log("Play v2");
console.log(matchResult);
matchResult.steps.forEach((s, i) => {
    const comment = format(s.comment, {
        player: s.pl ? s.pl.name : "UNKNOWN",
        player2: s.pl2 ? s.pl2.name : "UNKNOWN"
    });
    s.comment = comment;
});

// Start anim
step(matchResult, 0, {a:0, b:0, play: 0, step: 0, teama: teamA, teamb:teamB});

const sa = (array1, array2) => {
    return array1.map(function (num, idx) {
        return num + array2[idx];
    });
};

const result = range(100).map(i => {
    const rs = playFunction(alinA, alinB);
    return rs.score;
}).map(sc => {
    return [sc[0]>sc[1], sc[0]===sc[1], sc[0]<sc[1], sc[0], sc[1]];
}).reduce((total, currentValue, currentIndex, arr) => {
    return sa(total, currentValue);
}, [0,0,0, 0, 0]);

console.log(result);
*/
