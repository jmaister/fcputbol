import { LeagueStatus } from "db/entity/league.entity";

import Chip from '@material-ui/core/Chip';

interface LeagueStatusParams {
    status: LeagueStatus
}

const strings = {
};
strings[LeagueStatus.ORGANIZING] = "Organizando";
strings[LeagueStatus.ONGOING] = "En curso";
strings[LeagueStatus.FINISHED] = "Finalizada";

export default function LeagueStatusChip({status}: LeagueStatusParams) {

    const st = strings[status];

    return (
        <Chip label={st} />
    );
}
