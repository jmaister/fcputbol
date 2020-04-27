import { createConnection, getConnection } from "typeorm";
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { User } from './entity/user.entity';
import { Team } from './entity/team.entity';
import { Player } from './entity/player.entity';

import ormconfig from '../ormconfig.json';

export default async () => {
    try {
        console.log("loading connection...");
        const connection = await getConnection('default');
        return connection;
    } catch (error) {
        console.log("* error db *", error);

        const opts = ({
            ...ormconfig,
            "entities": [
                //"./entity/** / *.ts"
                //"src/bar/entities/** / *.ts",
                User,
                Team,
                Player,
            ]
        });

        return await createConnection(opts as SqliteConnectionOptions)
            .then(async connection => {
                console.log("connection created...");
                return connection;
            }).catch(error => console.log("* error2 db *", error));
    }
}

