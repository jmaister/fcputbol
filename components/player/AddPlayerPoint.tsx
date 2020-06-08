import { useState } from "react";

import { Button } from "@material-ui/core";

import { PlayerStat } from "db/entity/player.entity";
import Router from "next/router";
import Loading from "components/Loading";


export interface AddPlayerPointProps {
    leagueId: number
    teamId: number
    playerId: number
    stat: PlayerStat
}

export default function AddPlayerPoint({leagueId, teamId, playerId, stat}: AddPlayerPointProps) {
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const addPoint = () => {
        setErrorMsg(null);
        setIsLoading(true);

        const values = {
            leagueId,
            playerId,
            points: 1,
            stat,
            date: new Date()
        };

        return fetch('/api/addplayerpoint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            .then((response) => response.json())
            .then(response => {
                console.log("fetch response data", response);
                if (response.ok) {
                    Router.push('/team/' + teamId);
                } else {
                    setErrorMsg(response.message);
                }
                setIsLoading(false);
            }).catch(error => {
                setErrorMsg(error);
                setIsLoading(false);
            });
    }

    return <>
        <Button
                variant="contained"
                color="primary"
                onClick={addPoint}
                disabled={isLoading}
        >
            +1
        </Button>
        <Loading isLoading={isLoading}></Loading>
    </>
}
