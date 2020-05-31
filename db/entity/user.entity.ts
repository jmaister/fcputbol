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

export enum UserMoneyType {
    SEASON_START = "SEASON_START",
    PLAYER_BUY = "PLAYER_BUY",
    PLAYER_SELL = "PLAYER_SELL",
    MATCH_WIN = "MATCH_WIN",
    MATCH_DRAW = "MATCH_DRAW",
    MATCH_LOSE = "MATCH_LOSE",
    GOAL = "GOAL",
}

@Entity()
export class UserMoney {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    user: User;

    @ManyToOne(type => League)
    league: League;

    @Column({ type: 'int' })
    amount: number;

    @Column("varchar")
    type: UserMoneyType;

    @Column('datetime')
    date: Date;

    // Fields for PLAYER_BUY, PLAYER_SELL
    @ManyToOne(type => Player, {nullable: true})
    player: Player;


}
