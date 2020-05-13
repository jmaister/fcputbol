import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import TeamName from 'components/team/TeamName';

import moment from 'moment';
import { Classification } from 'db/entity/classification.entity';

interface ClassificationsTableParams {
    classifications: Classification[]
}

export default function ClassificationTable({ classifications }: ClassificationsTableParams) {

    // Sort by points, descending
    classifications.sort((a, b) => {
        const p = b.points - a.points;
        if (p === 0) {
            const scored = b.goalsScored - a.goalsScored;
            if (scored === 0) {
                const against = b.goalsAgainst - a.goalsAgainst;
                return against;
            }
            return scored;
        }
        return p;
    });

    return (<>
        <TableContainer component={Paper}>
            <Table className="matches-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Pos</TableCell>
                        <TableCell>Equipo</TableCell>
                        <TableCell>Puntos</TableCell>
                        <TableCell>GF</TableCell>
                        <TableCell>GC</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {classifications.map((cl, i) => (
                        <TableRow key={cl.id}>
                            <TableCell>{cl.id}</TableCell>
                            <TableCell>{i+1}</TableCell>
                            <TableCell><TeamName team={cl.team} /></TableCell>
                            <TableCell>{cl.points}</TableCell>
                            <TableCell>{cl.goalsScored}</TableCell>
                            <TableCell>{cl.goalsAgainst}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>);
}
