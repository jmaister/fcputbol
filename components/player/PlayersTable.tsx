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

import { Player, PlayerStatList } from 'db/entity/player.entity';
import { Lineup } from 'db/entity/lineup.entity';
import { Team } from 'db/entity/team.entity';
import { League } from 'db/entity/league.entity';

import Position from './Position';
import AddPlayerPoint from './AddPlayerPoint';
import Loading from 'components/Loading';
import { findById, containsId } from 'lib/utils';
import { validateLineup, powerColorClass } from 'lib/playerUtils';

interface PlayersTableParams {
    league: League
    team: Team
    players: Player[]
    lineup: Lineup
    isEditable: boolean
    availablePoints: number
    updateAvailablePoints: Function
}


export default function PlayersTable({ league, team, players, lineup, isEditable, availablePoints, updateAvailablePoints }: PlayersTableParams) {
    const [lineupPlayers, setLineupPlayers] = useState(lineup.players);
    const [selectedCount, setSelectedCount] = useState(11);
    const [messages, setMessages] = useState([]);
    const [hasErrors, setHasErrors] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setSelectedCount(lineupPlayers.length);
        const result = validateLineup(lineupPlayers, false);
        setMessages(result.messages);
        setHasErrors(result.hasErrors);
    }, [lineupPlayers]);

    const saveLineup = async () => {
        setIsLoading(true);

        const body = {
            teamId: team.id,
            playerIds: lineupPlayers.map(p => p.id)
        }
        try {
            const res = await fetch('/api/savelineup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.status === 200) {
                const response = await res.json();
                if (response.ok) {
                    setIsLoading(false);
                } else {
                    throw new Error(response.error);
                }
            } else {
                setIsLoading(false);
                throw new Error(await res.text())
            }
        } catch (error) {
            setIsLoading(false);
            console.error('An unexpected error happened occurred:', error);
            setErrorMsg(error.message);
        }
    };

    const changeSelection = (id:number, isPlayerSelected:boolean) => {
        if (isPlayerSelected) {
            // Remove player from lineup
            setLineupPlayers(lp => lp.filter(e => e.id !== id));
        } else {
            // Add player to lineup
            const addedPlayer = findById(players, id);
            setLineupPlayers(lp => lp.concat([addedPlayer]));
        }
    };

    return (<>
        <h3>Jugadores en la alineación: {selectedCount}</h3>

        <TableContainer component={Paper}>
            <Table className="players-table" size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
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
                        const isPlayerSelected = containsId(lineupPlayers, player.id);
                        return <TableRow
                                key={player.id}
                                hover
                            >
                            <TableCell>{player.num}</TableCell>
                            <TableCell padding="checkbox">
                                <input type="checkbox"
                                    checked={isPlayerSelected}
                                    disabled={isLoading || !isEditable}
                                    onChange={() => {
                                        changeSelection(player.id, isPlayerSelected);
                                        setIsDirty(true);
                                    }}
                                    />
                            </TableCell>
                            <TableCell component="th" scope="row">{player.name} {player.surname}</TableCell>
                            <TableCell><Position pos={player.position}></Position></TableCell>
                            {PlayerStatList.map(stat => {
                                const statValue = player[stat.toLowerCase()];
                                return <TableCell key={stat} className={powerColorClass(statValue)}>
                                    {isEditable?
                                    <AddPlayerPoint currentValue={statValue} leagueId={league.id} playerId={player.id} teamId={team.id} stat={stat}
                                        availablePoints={availablePoints} updateAvailablePoints={updateAvailablePoints} />
                                    :
                                    {statValue}
                                    }
                                </TableCell>
                            })}
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
        {isEditable? <>
            {messages.length > 0 ?
                <ul>
                    {messages.map((m,i) => <li key={i}><Typography color={m.type}>{m.type=="error"?"❌":"✓"} {m.msg}</Typography></li>)}
                </ul>
            : null}
            {errorMsg && <Typography color="error"><p>{errorMsg}</p></Typography>}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={saveLineup}
                disabled={isLoading || hasErrors || !isDirty}>
                Guardar alineación
            </Button>
            <Loading isLoading={isLoading} />
        </> : null}
    </>);
}
