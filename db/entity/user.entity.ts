import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { Team } from './team.entity';
import { League } from './league.entity';
import { Player } from './player.entity';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {
        unique: true
    })
    username: string;

    //@Column('varchar', {
    //    unique: true
    //})
    //email: string;

    @Column('varchar')
    password: string;

    @OneToMany(type => Team, team => team.user)
    teams: Team[];
}

export enum UserAssetType {
    MONEY = "MONEY",
    PLAYER_POINTS = "PLAYER_POINTS",

}

export enum UserAssetSubType {
    SEASON_START = "SEASON_START",
    PLAYER_BUY = "PLAYER_BUY",
    PLAYER_SELL = "PLAYER_SELL",
    MATCH_WIN = "MATCH_WIN",
    MATCH_DRAW = "MATCH_DRAW",
    MATCH_LOSE = "MATCH_LOSE",
    GOAL = "GOAL",
}

@Entity()
export class UserAssets {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    user: User;

    @ManyToOne(type => League)
    league: League;

    @Column({ type: 'int' })
    amount: number;

    @Column("varchar")
    type: UserAssetType;

    @Column("varchar")
    subType: UserAssetSubType;

    @Column('datetime')
    date: Date;

    // Fields for PLAYER_BUY, PLAYER_SELL, PLAYER_* stats
    @ManyToOne(type => Player, {nullable: true})
    player: Player;
}
