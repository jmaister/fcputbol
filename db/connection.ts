import { createConnection, getConnection } from "typeorm";
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { User } from './entity/user.entity';
import { Team } from './entity/team.entity';
import { Player } from './entity/player.entity';

import ormconfig from '../ormconfig.json';


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


export default async () => {
    try {
        console.log("*** loading connection...");
        return getConnection('default');
    } catch (error) {
        console.log("*** error db *", error);

        return await createConnection(opts as SqliteConnectionOptions)
            .then(async connection => {
                console.log("*** connection created");
                return connection;
            }).catch(error => console.log("*** error2 db *", error));
    }
}

