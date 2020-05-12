import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { Match, MatchStatus } from 'db/entity/match.entity';
import Link from 'next/link';
import TeamName from 'components/team/TeamName';
import MatchStatusChip from './MatchStatusChip';

import moment from 'moment';

interface MatchesTableParams {
    matches: Match[]
}

export default function MatchesTable({ matches }: MatchesTableParams) {
    moment.locale("es");

    return (
        <TableContainer component={Paper}>
            <Table className="matches-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Jornada</TableCell>
                        <TableCell>Casa</TableCell>
                        <TableCell>Visitante</TableCell>
                        <TableCell>Resultado</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {matches.map((match) => (
                        <TableRow key={match.id}>
                            <TableCell>{match.id}</TableCell>
                            <TableCell>{match.round}</TableCell>
                            <TableCell><TeamName team={match.home} /></TableCell>
                            <TableCell><TeamName team={match.away} /></TableCell>
                            <TableCell>{match.resultHome} - {match.resultAway}</TableCell>
                            <TableCell>{moment(match.matchDate).calendar()}</TableCell>
                            <TableCell><MatchStatusChip status={match.status} /></TableCell>
                            <TableCell>{match.status === MatchStatus.FINISHED ?
                                <Link href={'matchresult/' + match.id}><a>Ver partido</a></Link>
                                :null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
