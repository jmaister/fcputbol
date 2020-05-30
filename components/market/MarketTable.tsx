import { Fragment } from 'react';
import moment from 'moment';

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
import { MarketPlayer, MarketBidStatus } from 'db/entity/marketplayer.entity';
import Bid from './Bid';
import { getBestBid, calculateNextBid } from 'lib/marketUtils';
import { UserMoneyInfo } from 'lib/UserService';

interface MarketTableProps {
    marketPlayers: MarketPlayer[]
    leagueId: number
    userMoneyInfo: UserMoneyInfo
}


export default function MarketTable({ marketPlayers, leagueId, userMoneyInfo }: MarketTableProps) {
    // TODO: get locale from user
    const NF = new Intl.NumberFormat("es-ES");
    moment.locale('es');

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
                        const bids = marketPlayer.bids.filter(b => b.status === MarketBidStatus.PLACED);
                        const bestBid = getBestBid(bids);
                        const nextBid = calculateNextBid(bestBid, marketPlayer.startingPrice);
                        return <Fragment key={'frg_'+marketPlayer.id}>
                            <TableRow
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
                                <TableCell align="right">{NF.format(marketPlayer.startingPrice)}</TableCell>
                            </TableRow>
                            {bids.map((bid, i) => {
                                return <TableRow key={bid.id}>
                                    <TableCell colSpan={5} />
                                    <TableCell>{moment(bid.createdDate).calendar()}</TableCell>
                                    <TableCell>@{bid.user.username}</TableCell>
                                    <TableCell align="right">{NF.format(bid.amount)}</TableCell>
                                </TableRow>
                            })}
                            <TableRow key={'bid_'+player.id}>
                                <TableCell colSpan={4} />
                                <TableCell colSpan={4}>
                                    <Bid marketPlayerId={marketPlayer.id} startingPrice={nextBid} leagueId={leagueId} userMoneyInfo={userMoneyInfo} />
                                </TableCell>
                            </TableRow>
                        </Fragment>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </>);
}
