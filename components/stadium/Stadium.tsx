import { useState } from "react";

import { format } from "../../lib/utils";

import { Match, MatchStep } from "db/entity/match.entity";
import { Player, Positions } from "../../db/entity/player.entity";
import { Lineup } from "db/entity/lineup.entity";

interface StadiumParams {
    match: Match
    step: MatchStep
}

function PlayerView(player: Player, className: string) {
    return (
        <div key={player.id} id={"" + player.id} className={'field_player '+ className}>
            <span className="player_number">{player.num}</span>
            <span className="field_player_name">{player.name}<br/>{player.surname}</span>
        </div>
    )
}

function showLine(lineup: Lineup, position: Positions, step: MatchStep) {
    return lineup.players.filter(p => p.position === position)
        .map(player => {
            let className = "";
            if (step.player && step.player.id === player.id) {
                className = "highlight_player_ball";
            } else if (step.player2 && step.player2.id === player.id) {
                className = "highlight_player";
            }
            return PlayerView(player, className);
        });
}

export function Stadium({ match, step }: StadiumParams) {

    const comment = format(step.comment, step);
    return (
        <div className="stadium">
            <div>{match.home.name} vs {match.away.name}</div>
            <div>
                Resultado: <span>{step.currentGoalHome}</span> - <span>{step.currentGoalAway}</span>
            </div>
            <div>
                <div>Jugada: <span>{step.stepNumber} de {match.stepsCount}</span></div>
                <div>Tiempo: <span>{step.t}'</span></div>
            </div>
            <div className={'field field-state-' + step.state}>
                <div className="field_line team-home state-GB">
                    <span className="goal">GOL</span>
                </div>
                <div className="field_line team-home state-PA">
                    {showLine(match.homeLineup, Positions.gk, step)}
                </div>
                <div className="field_line team-home state-DA">
                    {showLine(match.homeLineup, Positions.def, step)}
                </div>
                <div className="field_line team-away state-DA state-PA">
                    {showLine(match.awayLineup, Positions.fw, step)}
                </div>
                <div className="field_line team-home state-M">
                    {showLine(match.homeLineup, Positions.mid, step)}
                </div>
                <div className="field_line team-away state-M">
                    {showLine(match.awayLineup, Positions.mid, step)}
                </div>
                <div className="field_line team-home state-DB state-PB">
                    {showLine(match.homeLineup, Positions.fw, step)}
                </div>
                <div className="field_line team-away state-DB">
                    {showLine(match.awayLineup, Positions.def, step)}
                </div>
                <div className="field_line team-away state-PB">
                    {showLine(match.awayLineup, Positions.gk, step)}
                </div>
                <div className="field_line team-away state-GA">
                    <span className="goal">GOL</span>
                </div>
            </div>
            <div>Comentario: {comment}</div>
        </div>
    );
}
