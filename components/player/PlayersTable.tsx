import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Player } from '../../db/entity/player.entity';


const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

interface PlayersTableParams {
    players: Player[]
}

export default function PlayersTable({ players }: PlayersTableParams) {

    const classes = useStyles();

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell align="right">Nombre</TableCell>
                        <TableCell align="right">Posición</TableCell>
                        <TableCell align="right">Parada</TableCell>
                        <TableCell align="right">Defensa</TableCell>
                        <TableCell align="right">Pase</TableCell>
                        <TableCell align="right">Regate</TableCell>
                        <TableCell align="right">Tiro</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {players.map((player) => (
                        <TableRow key={player.id}>
                            <TableCell align="right">{player.id}</TableCell>
                            <TableCell component="th" scope="row">{player.name} {player.surname}</TableCell>
                            <TableCell>{player.position}</TableCell>
                            <TableCell align="right">{player.save}</TableCell>
                            <TableCell align="right">{player.defense}</TableCell>
                            <TableCell align="right">{player.pass}</TableCell>
                            <TableCell align="right">{player.dribble}</TableCell>
                            <TableCell align="right">{player.shot}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
