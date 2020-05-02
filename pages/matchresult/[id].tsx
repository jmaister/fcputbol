import { useState } from 'react'

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

    return <Layout>
        <h1>Resultado del partido</h1>
        id: /{id}/

        <Stadium match={match} step={match.matchSteps[0]}></Stadium>

        <ul>
            {match.matchSteps.map(s => <li key={s.id}>{s.t}/{s.stepNumber}/{s.comment}</li>)}
        </ul>

        {errorMsg ? <Typography color="error">{errorMsg}</Typography> : null}
    </Layout>
}

export async function getServerSideProps(context) {
    const matchId = context.params.id;
    let match = await findMatch(matchId);
    // Hack
    match = JSON.parse(JSON.stringify(match));

    // Order
    match.matchSteps.sort((a, b) => {
        return a.stepNumber - b.stepNumber;
    });

    //let match = JSON.parse(fs.readFileSync('match1.json', 'utf8'));

    return {
        props: {
            id: matchId,
            match: match
        }
    };
}
