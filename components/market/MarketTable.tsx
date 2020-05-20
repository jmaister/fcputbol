import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Position from '../player/Position';
import Loading from 'components/Loading';
import { containsId } from 'lib/utils';
import { powerColorClass } from 'lib/playerUtils';
import { MarketPlayer } from 'db/entity/marketplayer.entity';

interface MarketTableProps {
    marketPlayers: MarketPlayer[]
}


export default function MarketTable({ marketPlayers }: MarketTableProps) {

    return (<>
        <TableContainer component={Paper}>
            <Table className="players-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Posición</TableCell>
                        <TableCell>Parada</TableCell>
                        <TableCell>Defensa</TableCell>
                        <TableCell>Pase</TableCell>
                        <TableCell>Regate</TableCell>
                        <TableCell>Tiro</TableCell>
                        <TableCell>Precio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {marketPlayers.map((marketPlayer) => {
                        const player = marketPlayer.player;
                        return <TableRow
                                key={player.id}
                                hover
                            >
                            <TableCell component="th" scope="row">{player.name} {player.surname}</TableCell>
                            <TableCell><Position pos={player.position}></Position></TableCell>
                            <TableCell className={powerColorClass(player.save)}>{player.save}</TableCell>
                            <TableCell className={powerColorClass(player.defense)}>{player.defense}</TableCell>
                            <TableCell className={powerColorClass(player.pass)}>{player.pass}</TableCell>
                            <TableCell className={powerColorClass(player.dribble)}>{player.dribble}</TableCell>
                            <TableCell className={powerColorClass(player.shot)}>{player.shot}</TableCell>
                            <TableCell align="right">{Intl.NumberFormat().format(marketPlayer.startingPrice)}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </>);
}
