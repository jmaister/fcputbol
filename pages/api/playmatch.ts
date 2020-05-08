import { getSession } from '../../lib/iron';
import { play, MatchResult } from '../../lib/play/probs';
import { Match } from 'db/entity/match.entity';

import { findTeam } from '../../lib/TeamService';
import { saveMatch } from '../../lib/MatchService';

export default async function playMatch(req, res) {
    const session = await getSession(req);

    if (req.method === 'POST') {
        try {
            // Query teams
            const home = await findTeam(req.body.home);
            // const home = {"id":1,"name":"equipo1","players":[{"id":1,"name":"Mario","surname":"Bañuelos","num":1,"position":"gk","save":25,"defense":20,"pass":21,"dribble":21,"shot":29},{"id":2,"name":"Felipe","surname":"Reina","num":2,"position":"gk","save":29,"defense":22,"pass":20,"dribble":24,"shot":27},{"id":3,"name":"Marc","surname":"Ampiée","num":3,"position":"gk","save":23,"defense":28,"pass":28,"dribble":30,"shot":25},{"id":4,"name":"Óscar","surname":"Oporta","num":4,"position":"def","save":28,"defense":30,"pass":21,"dribble":24,"shot":30},{"id":5,"name":"José Miguel","surname":"Trocanis","num":5,"position":"def","save":21,"defense":22,"pass":24,"dribble":30,"shot":30},{"id":6,"name":"Santiago","surname":"Real","num":6,"position":"def","save":22,"defense":21,"pass":23,"dribble":30,"shot":29},{"id":7,"name":"Julián","surname":"Oliviera","num":7,"position":"def","save":22,"defense":29,"pass":30,"dribble":26,"shot":20},{"id":8,"name":"Víctor","surname":"Sánchez","num":8,"position":"def","save":25,"defense":22,"pass":20,"dribble":23,"shot":22},{"id":9,"name":"Rafael","surname":"Puente","num":9,"position":"mid","save":20,"defense":23,"pass":22,"dribble":21,"shot":27},{"id":10,"name":"Sebastián","surname":"Gomis","num":10,"position":"mid","save":24,"defense":21,"pass":30,"dribble":26,"shot":21},{"id":11,"name":"José Luis","surname":"Izrael","num":11,"position":"mid","save":21,"defense":22,"pass":23,"dribble":27,"shot":20},{"id":12,"name":"Mario","surname":"Sandí","num":12,"position":"mid","save":22,"defense":22,"pass":21,"dribble":30,"shot":28},{"id":13,"name":"Pedro","surname":"Tejeda","num":13,"position":"mid","save":22,"defense":27,"pass":23,"dribble":28,"shot":26},{"id":14,"name":"Vicente","surname":"Naim","num":14,"position":"fw","save":29,"defense":24,"pass":29,"dribble":28,"shot":30},{"id":15,"name":"Agustín","surname":"Echandi","num":15,"position":"fw","save":25,"defense":23,"pass":25,"dribble":22,"shot":22},{"id":16,"name":"Manuel","surname":"Barroso","num":16,"position":"fw","save":28,"defense":28,"pass":25,"dribble":29,"shot":24},{"id":17,"name":"Diego","surname":"Gabriel","num":17,"position":"fw","save":20,"defense":21,"pass":21,"dribble":22,"shot":22},{"id":18,"name":"Alex","surname":"Vargo","num":18,"position":"fw","save":27,"defense":29,"pass":28,"dribble":25,"shot":23}],"lineup":{"id":1,"players":[{"id":2,"name":"Felipe","surname":"Reina","num":2,"position":"gk","save":29,"defense":22,"pass":20,"dribble":24,"shot":27},{"id":5,"name":"José Miguel","surname":"Trocanis","num":5,"position":"def","save":21,"defense":22,"pass":24,"dribble":30,"shot":30},{"id":6,"name":"Santiago","surname":"Real","num":6,"position":"def","save":22,"defense":21,"pass":23,"dribble":30,"shot":29},{"id":8,"name":"Víctor","surname":"Sánchez","num":8,"position":"def","save":25,"defense":22,"pass":20,"dribble":23,"shot":22},{"id":9,"name":"Rafael","surname":"Puente","num":9,"position":"mid","save":20,"defense":23,"pass":22,"dribble":21,"shot":27},{"id":10,"name":"Sebastián","surname":"Gomis","num":10,"position":"mid","save":24,"defense":21,"pass":30,"dribble":26,"shot":21},{"id":11,"name":"José Luis","surname":"Izrael","num":11,"position":"mid","save":21,"defense":22,"pass":23,"dribble":27,"shot":20},{"id":12,"name":"Mario","surname":"Sandí","num":12,"position":"mid","save":22,"defense":22,"pass":21,"dribble":30,"shot":28},{"id":14,"name":"Vicente","surname":"Naim","num":14,"position":"fw","save":29,"defense":24,"pass":29,"dribble":28,"shot":30},{"id":16,"name":"Manuel","surname":"Barroso","num":16,"position":"fw","save":28,"defense":28,"pass":25,"dribble":29,"shot":24},{"id":18,"name":"Alex","surname":"Vargo","num":18,"position":"fw","save":27,"defense":29,"pass":28,"dribble":25,"shot":23}]}} as Team;
            const away = await findTeam(req.body.away);
            //const away = {"id":2,"name":"equipo2","players":[{"id":19,"name":"Guillermo","surname":"Marín","num":1,"position":"gk","save":25,"defense":29,"pass":21,"dribble":22,"shot":24},{"id":20,"name":"Joan","surname":"Zedan","num":2,"position":"gk","save":21,"defense":23,"pass":25,"dribble":22,"shot":30},{"id":21,"name":"Salvador","surname":"Arceyudh","num":3,"position":"gk","save":25,"defense":26,"pass":21,"dribble":22,"shot":20},{"id":22,"name":"Marc","surname":"Pandolfo","num":4,"position":"def","save":29,"defense":30,"pass":26,"dribble":29,"shot":21},{"id":23,"name":"Rubén","surname":"Pizarro","num":5,"position":"def","save":21,"defense":25,"pass":27,"dribble":20,"shot":20},{"id":24,"name":"Felipe","surname":"Rocabado","num":6,"position":"def","save":26,"defense":22,"pass":21,"dribble":27,"shot":27},{"id":25,"name":"Diego","surname":"Regaño","num":7,"position":"def","save":21,"defense":29,"pass":26,"dribble":28,"shot":25},{"id":26,"name":"Domingo","surname":"Guardia","num":8,"position":"def","save":26,"defense":30,"pass":25,"dribble":22,"shot":28},{"id":27,"name":"Manuel","surname":"Solera","num":9,"position":"mid","save":22,"defense":27,"pass":30,"dribble":20,"shot":27},{"id":28,"name":"Miguel","surname":"Barteles","num":10,"position":"mid","save":29,"defense":20,"pass":26,"dribble":28,"shot":25},{"id":29,"name":"Joaquín","surname":"Saravia","num":11,"position":"mid","save":23,"defense":20,"pass":23,"dribble":29,"shot":24},{"id":30,"name":"Emilio","surname":"Delso","num":12,"position":"mid","save":24,"defense":23,"pass":21,"dribble":29,"shot":30},{"id":31,"name":"Agustín","surname":"Barbagallo","num":13,"position":"mid","save":26,"defense":25,"pass":26,"dribble":21,"shot":25},{"id":32,"name":"César","surname":"Zegarra","num":14,"position":"fw","save":30,"defense":22,"pass":29,"dribble":27,"shot":20},{"id":33,"name":"Alejandro","surname":"Pauth","num":15,"position":"fw","save":30,"defense":21,"pass":27,"dribble":26,"shot":25},{"id":34,"name":"Iván","surname":"Corales","num":16,"position":"fw","save":29,"defense":24,"pass":29,"dribble":20,"shot":30},{"id":35,"name":"Alejandro","surname":"Buzano","num":17,"position":"fw","save":28,"defense":23,"pass":20,"dribble":27,"shot":22},{"id":36,"name":"Víctor","surname":"Aragonés","num":18,"position":"fw","save":25,"defense":24,"pass":22,"dribble":30,"shot":20}],"lineup":{"id":2,"players":[{"id":20,"name":"Joan","surname":"Zedan","num":2,"position":"gk","save":21,"defense":23,"pass":25,"dribble":22,"shot":30},{"id":22,"name":"Marc","surname":"Pandolfo","num":4,"position":"def","save":29,"defense":30,"pass":26,"dribble":29,"shot":21},{"id":24,"name":"Felipe","surname":"Rocabado","num":6,"position":"def","save":26,"defense":22,"pass":21,"dribble":27,"shot":27},{"id":25,"name":"Diego","surname":"Regaño","num":7,"position":"def","save":21,"defense":29,"pass":26,"dribble":28,"shot":25},{"id":27,"name":"Manuel","surname":"Solera","num":9,"position":"mid","save":22,"defense":27,"pass":30,"dribble":20,"shot":27},{"id":28,"name":"Miguel","surname":"Barteles","num":10,"position":"mid","save":29,"defense":20,"pass":26,"dribble":28,"shot":25},{"id":29,"name":"Joaquín","surname":"Saravia","num":11,"position":"mid","save":23,"defense":20,"pass":23,"dribble":29,"shot":24},{"id":31,"name":"Agustín","surname":"Barbagallo","num":13,"position":"mid","save":26,"defense":25,"pass":26,"dribble":21,"shot":25},{"id":32,"name":"César","surname":"Zegarra","num":14,"position":"fw","save":30,"defense":22,"pass":29,"dribble":27,"shot":20},{"id":34,"name":"Iván","surname":"Corales","num":16,"position":"fw","save":29,"defense":24,"pass":29,"dribble":20,"shot":30},{"id":35,"name":"Alejandro","surname":"Buzano","num":17,"position":"fw","save":28,"defense":23,"pass":20,"dribble":27,"shot":22}]}} as Team;

            // Play a match
            const result: MatchResult = play(home, away);

            const match = {
                home,
                away,
                homeLineup: home.lineup,
                awayLineup: away.lineup,
                resultHome: result.score[0],
                resultAway: result.score[1],
            } as Match;

            const savedMatch = await saveMatch(match, result.steps);

            res.status(200).json({ ok: true, matchId: savedMatch.id, home, away });
        } catch (error) {
            console.log("playMatch", error);
            res.status(404).json({ ok: false, message: "Error on playMatch.", body: req.body, error: error });
        }

    } else {
        res.status(400).json({ message: "not supported yet" });
    }

}


