import { Match, MatchStep } from "db/entity/match.entity";
import { format } from "../../lib/utils";
import { Player, Positions } from "../../db/entity/player.entity";
import { Lineup } from "db/entity/lineup.entity";

export interface StadiumParams {
    match: Match
    step: MatchStep
}

export function PlayerView(player: Player) {
    return (
        <div key={player.id} id={"" + player.id} className="field_player">
            {player.name} {player.surname}
        </div>
    )
}

function Line(players: Player[]) {
    return players.map(PlayerView);
}

function filterPlayers(players: Player[], position: Positions): Player[] {
    return players.filter(p => p.position === position);
}

function showLine(lineup: Lineup, position: Positions) {
    return Line(filterPlayers(lineup.players, position));
}

export function Stadium({ match, step }: StadiumParams) {

    const comment = format(step.comment, step);
    return (
        <div className="stadium">
            <div>{match.home.name} vs {match.away.name}</div>
            <div>
                Resultado final: <span>{match.resultHome}</span> - <span>{match.resultAway}</span>
            </div>
            <div>
                <div>Jugada: <span>{step.t} de {match.stepsCount}</span></div>
            </div>
            <div className="field">
                <div id="pora" className="field_line team-home">
                    {showLine(match.homeLineup, Positions.gk)}
                </div>
                <div id="defa" className="field_line team-home">
                    {showLine(match.homeLineup, Positions.def)}
                </div>
                <div id="delb" className="field_line team-away">
                    {showLine(match.awayLineup, Positions.fw)}
                </div>
                <div id="meda" className="field_line team-home">
                    {showLine(match.homeLineup, Positions.mid)}
                </div>
                <div id="medb" className="field_line team-away">
                    {showLine(match.awayLineup, Positions.mid)}
                </div>
                <div id="dela" className="field_line team-home">
                    {showLine(match.homeLineup, Positions.fw)}
                </div>
                <div id="defb" className="field_line team-away">
                    {showLine(match.awayLineup, Positions.def)}
                </div>
                <div id="porb" className="field_line team-away">
                    {showLine(match.awayLineup, Positions.gk)}
                </div>
            </div>
            <div>Comentario: {comment}</div>
            <style jsx>{`
            .field {
                display: flex;
                justify-content: space-between;
                background-color: #8CB27C;
                border: 1px solid white;
                padding: 5px;
                min-width: 680px;
            }
            .field_line {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                flex-grow: 1;
                padding: 1px;
            }
            .field_player {
                border: 5px solid black;
                padding: 3px;
                margin: 5px;
                color: white;
                font-size: 10px;
                font-family: Arial, Helvetica, sans-serif;
                text-align: center;
                height: 3em;
            }

            .team-home .field_player {
                background-color: darkblue;
            }
            .team-away .field_player {
                background-color: darkred;
            }
            .highlight {
                background-color: lightblue;
            }
            .highlight_goal {
                background-color: lightseagreen;
            }
            .highlight_player_ball {
                border-color: crimson;
            }
            .highlight_player_ball:after {
                content: "";
                background: url("balon.png") round center;
                width: 20px;
                height: 20px;
            }
            .team-home .highlight_player_ball:after {
                float: right;
            }
            .team-away .highlight_player_ball:after {
                float: left;
            }

            .highlight_player {
                border-color: crimson;
            }

            `}</style>
        </div>
    );
}
