import { createConnection, getConnection } from "typeorm";
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
        return await createConnection({
            ...ormconfig,
            "entities": [
                //"./entity/** / *.ts"
                //"src/bar/entities/** / *.ts",
                User,
                Team,
                Player,
            ]
        }).then(async connection => {
            console.log("connection created...");
            return connection;
        }).catch(error => console.log("* error2 db *", error));
    }
}

