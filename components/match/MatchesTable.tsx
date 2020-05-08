import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { Match } from 'db/entity/match.entity';
import Link from 'next/link';

interface MatchesTableParams {
    matches: Match[]
}

export default function MatchesTable({ matches }: MatchesTableParams) {

    return (
        <TableContainer component={Paper}>
            <Table className="matches-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell align="right">Casa</TableCell>
                        <TableCell align="right">Visitante</TableCell>
                        <TableCell align="right">Resultado</TableCell>
                        <TableCell align="right">Fecha</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {matches.map((match) => (
                        <TableRow key={match.id}>
                            <TableCell align="right">{match.id}</TableCell>
                            <TableCell><Link href={'team/' + match.home.id}><a>{match.home.name}</a></Link></TableCell>
                            <TableCell><Link href={'team/' + match.away.id}><a>{match.away.name}</a></Link></TableCell>
                            <TableCell>{match.resultHome} - {match.resultAway}</TableCell>
                            <TableCell>{new Date(match.createdDate).toLocaleString()}</TableCell>
                            <TableCell><Link href={'matchresult/' + match.id}><a>Ver partido</a></Link></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
