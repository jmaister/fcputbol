import { createConnection, getConnection, Connection } from "typeorm";
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { User } from './entity/user.entity';
import { Team } from './entity/team.entity';
import { Player } from './entity/player.entity';
import { MatchStep, Match } from "./entity/match.entity";
import { Lineup } from "./entity/lineup.entity";

import ormconfig from '../ormconfig.json';


const opts = ({
    ...ormconfig,
    "entities": [
        User,
        Team,
        Player,
        Match,
        MatchStep,
        Lineup
    ]
});


export default async ():Promise<Connection> => {
    try {
        console.log("*** loading connection...");
        return getConnection('default');
    } catch (error) {
        console.log("*** error db *", error);
        try {
            return await createConnection(opts as SqliteConnectionOptions)
        } catch (error2) {
            throw new Error("Error creating connection: " + error2)
        }
    }
}

