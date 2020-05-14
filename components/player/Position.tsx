
import {Positions} from '../../db/entity/player.entity';

interface PositionParams {
    pos: string
}

export default function Position({pos}:PositionParams) {

    let name = "UNK";
    if (pos === Positions.gk) {
        name = "POR 🥅";
    } else if (pos === Positions.def) {
        name = "DEF 🪓";
    } else if (pos === Positions.mid) {
        name = "MED 👨‍🔬";
    } else if (pos === Positions.fw) {
        name = "DEL ⚽";
    }

    return (
        <span>{name}</span>
    );
}
