import { useState, useEffect } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';

import { Player } from '../../db/entity/player.entity';
import { Lineup } from 'db/entity/lineup.entity';

import Position from './Position';

interface PlayersTableParams {
    players: Player[]
    lineup: Lineup
}

const colorFn = (power) => {
    return "power-" + Math.floor((power / 10) + 1);
};

const findById = (arr:Player[], id:number): Player => {
    return arr.find(e => e.id === id);
};

const containsId = (arr:Player[], id:number): boolean => {
    const found = findById(arr, id);
    return found != null;
};

export default function PlayersTable({ players, lineup }: PlayersTableParams) {
    const [lineupPlayers, setLineupPlayers] = useState(lineup.players);
    const [selectedCount, setSelectedCount] = useState(11);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        let count = lineupPlayers.length;
        setSelectedCount(count);
        const msgs = [];
        if (count > 11) {
            msgs.push("Demasiados jugadores alineados, debes tener 11.");
        } else if (count < 11) {
            msgs.push("Pocos jugadores alineados, debes tener 11.")
        }
        setMessages(msgs);
    }, [lineupPlayers]);

    const changeSelection = (id:number) => {
        console.log("click", id);
        const found = containsId(lineupPlayers, id);
        if (found) {
            const newLineup = lineupPlayers.filter(lp => lp.id === id);
            setLineupPlayers(newLineup);
        } else {
            const addedPlayer = findById(players, id);
            setLineupPlayers(lp => lp.concat([addedPlayer]));
        }
    };

    return (<>
        <h3>Jugadores en la alineación: {selectedCount}</h3>
        {messages.length > 0 ?
            <ul className="error">
                {messages.map(m => <li>{m}</li>)}
            </ul>
        : null}
        <TableContainer component={Paper}>
            <Table className="players-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Num</TableCell>
                        <TableCell>Alineación</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Posición</TableCell>
                        <TableCell>Parada</TableCell>
                        <TableCell>Defensa</TableCell>
                        <TableCell>Pase</TableCell>
                        <TableCell>Regate</TableCell>
                        <TableCell>Tiro</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {players.map((player) => {
                        // const isPlayerSelected = selectedPlayers[player.id];
                        const isPlayerSelected = containsId(lineupPlayers, player.id);
                        return <TableRow
                                key={player.id}
                                hover
                            >
                            <TableCell>{player.id}</TableCell>
                            <TableCell>{player.num}</TableCell>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={isPlayerSelected}
                                    onChange={() => changeSelection(player.id)}
                                    />
                            </TableCell>
                            <TableCell component="th" scope="row">{player.name} {player.surname}</TableCell>
                            <TableCell><Position pos={player.position}></Position></TableCell>
                            <TableCell className={colorFn(player.save)}>{player.save}</TableCell>
                            <TableCell className={colorFn(player.defense)}>{player.defense}</TableCell>
                            <TableCell className={colorFn(player.pass)}>{player.pass}</TableCell>
                            <TableCell className={colorFn(player.dribble)}>{player.dribble}</TableCell>
                            <TableCell className={colorFn(player.shot)}>{player.shot}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </>);
}
