import { ConnectionManager, Connection, EntityManager, getConnectionManager, createConnection } from "typeorm";

import ormconfig from '../ormconfig.json';

import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { User } from './entity/user.entity';
import { Team } from './entity/team.entity';
import { Player } from './entity/player.entity';
import { MatchStep, Match } from "./entity/match.entity";
import { Lineup } from "./entity/lineup.entity";
import { League } from "./entity/league.entity";
import { Classification } from "./entity/classification.entity";
import { Round } from "./entity/round.entity";
import { Season } from "./entity/season.entity";
import { MarketPlayer, MarketBid } from "./entity/marketplayer.entity";

console.log('env', process.env.NODE_ENV);
let database = "fcputbol.sqlite";
let logging = ormconfig.logging;
if (process.env.NODE_ENV === 'test') {
    database = "fcputbol-test.sqlite";
    logging = false;
}

const databaseOptions = ({
    ...ormconfig,
    database,
    logging,
    "entities": [
        User,
        Team,
        Player,
        Lineup,
        League,
        Season,
        Round,
        Match,
        MatchStep,
        Classification,

        MarketPlayer,
        MarketBid,
    ]
});

/**
 * Database manager class
 */
export default class Database {
    private connectionManager: ConnectionManager;

    /**
     * Keeps track of whether this Database instance remembers making a new connection. If it doesn't,
     * and an existing connection was found anyway, that means that the module was hot-reloaded.
     */
    private hasCreatedConnection = false;

    constructor() {
        this.connectionManager = getConnectionManager();
    }

    private async getConnection(): Promise<Connection> {
        const DEFAULT_CONNECTION_NAME = 'default';
        const currentConnection = this.connectionManager.has(DEFAULT_CONNECTION_NAME)
            ? this.connectionManager.get(DEFAULT_CONNECTION_NAME)
            : undefined;
        // if connection exists but we don't remember creating it, it's because of hot reloading
        // and that means a new connection needs to be created, or else entity metadata won't match
        // from the old session.
        // https://stackoverflow.com/questions/60677582/entitymetadatanotfound-no-metadata-for-businessapplication-was-found
        if (currentConnection && !this.hasCreatedConnection) {
            console.debug('recreating connection due to hot reloading');
            if (currentConnection.isConnected) {
                await currentConnection.close();
            }
            console.debug('done closing, making new connection..');
            return this.createConnectionWithName(DEFAULT_CONNECTION_NAME);
        }
        if (currentConnection) {
            if (!currentConnection.isConnected) {
                return currentConnection.connect();
            } else return currentConnection;
        } else {
            return this.createConnectionWithName(DEFAULT_CONNECTION_NAME);
        }
    }

    private createConnectionWithName(name: string): Promise<Connection> {
        this.hasCreatedConnection = true;
        return createConnection(databaseOptions as SqliteConnectionOptions);
    }

    public getManager(): Promise<EntityManager> {
        return this.getConnection().then(conn => conn.manager);
    }
}
