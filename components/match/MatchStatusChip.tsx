import { MatchStatus } from "db/entity/match.entity";

import Chip from '@material-ui/core/Chip';

interface MatchStatusParams {
    status: MatchStatus
}

const strings = {
};
strings[MatchStatus.SCHEDULED] = "Previsto";
strings[MatchStatus.READY] = "Preparado";
strings[MatchStatus.FINISHED] = "Finalizado";

export default function MatchStatusChip({status}: MatchStatusParams) {

    const st = strings[status];

    return (
        <Chip label={st} />
    );
}
