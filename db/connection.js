import { createConnection, getConnection } from "typeorm";
import { User } from './entity/user.entity';
import { Team } from './entity/team.entity';

export default async () => {
    try {
        console.log("loading connection...");
        const connection = await getConnection('default');
        return connection;
    } catch (error) {
        console.log("* error db *", error);
        return await createConnection({
            "name": "default",
            "type": "sqlite",
            "database": "fcputbol.sqlite",
            "synchronize": true,
            "logging": true,
            "entities": [
                //"./entity/**/*.ts"
                //"src/bar/entities/**/*.ts",
                User,
                Team,
            ],
            "migrations": [
                "db/migration/**/*.ts"
            ],
            "subscribers": [
                "db/subscriber/**/*.ts"
            ],
            "cli": {
                "entitiesDir": "db/entitie",
                "migrationsDir": "db/migration",
                "subscribersDir": "db/subscriber"
            }
        }).then(async connection => {
            console.log("connection created...");
            return connection;
        }).catch(error => console.log("* error2 db *", error));
    }
}

