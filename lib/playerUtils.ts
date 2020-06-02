import { Player, Positions, PlayerStat, PlayerStatList } from "db/entity/player.entity";

import { sample } from "./utils";

export function findById(arr:Player[], id:number): Player {
    return arr.find(e => {
        return e.id === id;
    });
};

export function containsId(arr:Player[], id:number): boolean {
    const found = findById(arr, id);
    return !!found;
};

export const allPositions = [Positions.gk, Positions.def, Positions.mid, Positions.fw];

export const PositionNames = {
    [Positions.gk]: "portero",
    [Positions.def]: "defensa",
    [Positions.mid]: "centrocampista",
    [Positions.fw]: "delantero",
};

interface SortedPlayers {
    [Positions.gk]: Player[]
    [Positions.def]: Player[]
    [Positions.mid]: Player[]
    [Positions.fw]: Player[]
}

export function sortPlayersByPosition(players:Player[]): SortedPlayers {
    const sortedPlayers = {
        [Positions.gk]: [],
        [Positions.def]: [],
        [Positions.mid]: [],
        [Positions.fw]: [],
    };
    players.forEach(p => {
        sortedPlayers[p.position].push(p);
    })

    return sortedPlayers;
}

export function createRandomLineup(players:Player[]) {
    const sortedPlayers = sortPlayersByPosition(players);

    const lineupPlayers = []
        .concat(sample(sortedPlayers[Positions.gk], 1))
        .concat(sample(sortedPlayers[Positions.def], 3))
        .concat(sample(sortedPlayers[Positions.mid], 4))
        .concat(sample(sortedPlayers[Positions.fw], 3));
    return lineupPlayers;

}

export interface Message {
    type: string
    msg: string
}

export interface LineupValidationResult {
    messages: Message[]
    hasErrors: boolean
}

export function validateLineup(players:Player[], onlyError:boolean):LineupValidationResult {
    let count = players.length;
    let msgs = [];
    if (count > 11) {
        msgs.push({ type: "error", msg: "Demasiados jugadores alineados, debes tener 11."});
    } else if (count < 11) {
        msgs.push({ type: "error", msg: "Pocos jugadores alineados, debes tener 11."});
    } else {
        msgs.push({ type: "primary", msg: "11 jugadores selecionados."});
    }

    const sortedPlayers = sortPlayersByPosition(players);
    // GK
    if (sortedPlayers[Positions.gk].length == 0) {
        msgs.push({ type: "error", msg: "Añade un portero."});
    } else if (sortedPlayers[Positions.gk].length > 1) {
        msgs.push({ type: "error", msg: "Sólo se puede alinear un portero."});
    } else {
        msgs.push({ type: "primary", msg: "Un portero seleccionado."});
    }

    // At least one of each type
    [Positions.def, Positions.mid, Positions.fw].forEach(pos => {
        const posName = PositionNames[pos];
        if (sortedPlayers[pos].length == 0) {
            msgs.push({ type: "error", msg: "Selecciona al menos un " + posName + "."});
        } else {
            msgs.push({ type: "primary", msg: "Al menos un " + posName + " seleccionado."});
        }
    });

    const hasErrors = msgs.filter(m => m.type === "error").length > 0;

    // keep only errors
    if (onlyError) {
        msgs = msgs.filter(m => m.type !== "error")
    }

    return {
        messages:msgs,
        hasErrors
    };
}

export interface Stats {
    sum: number,
    avg: number,
    max: number,
    min: number,
}

export function calculatePlayerStats(player:Player): Stats  {
    let sum = 0;
    let avg = 0;
    let max = 0;
    let min = 999999;
    PlayerStatList.forEach(statName => {
        const s = player[statName];
        sum = sum + s;
        if (max < s) {
            max = s;
        }
        if (min >s) {
            min = s;
        }
    });
    avg = sum / PlayerStatList.length;

    return {
        sum,
        avg,
        max,
        min
    } as Stats;
}


export function calculatePlayerPrice(player:Player): number {
    const stats = calculatePlayerStats(player);
    const price = (stats.max * 10 + stats.min * 5) * 1000;
    return price;
}

export function powerColorClass(power) {
    return "power-" + Math.floor((power / 10) + 1);
};
