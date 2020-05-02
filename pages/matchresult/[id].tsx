import fs from 'fs';

import { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Layout from '../../components/layout';
import { Stadium } from '../../components/stadium/Stadium';

import { findMatch } from 'lib/MatchService';
import { Match, MatchStep } from 'db/entity/match.entity';

interface MatchResultParams {
    id: string
    match: Match
}

export default function MatchResult({id, match}:MatchResultParams) {
    const [errorMsg, setErrorMsg] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (playing) {
                if (currentStep + 1 < match.stepsCount){
                    setCurrentStep(currentStep + 1);
                } else {
                    setPlaying(false);
                }
            }
        }, 75);
        return () => clearTimeout(timer);
    }, [playing, currentStep]);

    return <Layout>
        <h1>Resultado del partido</h1>

        <Button
            variant="contained"
            color="primary"
            onClick={() => setPlaying(!playing)}
        >
            {playing ? 'Pause':'Play'}
        </Button>
        <Stadium match={match} step={match.matchSteps[currentStep]}></Stadium>

        <ul>
            {match.matchSteps.map(s => <li key={s.id}>{s.t}/{s.stepNumber}/{s.comment}</li>)}
        </ul>

        {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}
    </Layout>
}

export async function getServerSideProps(context) {
    const matchId = context.params.id;
    let match = null;
    let DEBUG = true;


    if (DEBUG) {
        match = JSON.parse(fs.readFileSync('match.json', 'utf8'));

    } else {
        match = await findMatch(matchId);
        // Hack
        match = JSON.parse(JSON.stringify(match));

        // Order
        match.matchSteps.sort((a, b) => {
            return a.stepNumber - b.stepNumber;
        });
        fs.writeFileSync("match2.json", JSON.stringify(match));
    }

    return {
        props: {
            id: matchId,
            match: match
        }
    };
}
