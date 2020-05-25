import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { League } from './league.entity';
import { Player } from './player.entity';

export enum MarketPlayerStatus {
    OPEN  = "OPEN",
    ACCEPTED = "ACCEPTED",
    FINISHED = "FINISHED",
}

@Entity()
export class MarketPlayer {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => League)
    league: League;

    @ManyToOne(type => Team)
    team: Team;

    @ManyToOne(type => Player)
    player: Player;

    @Column({
        type: "varchar",
        default: MarketPlayerStatus.OPEN
    })
    status: MarketPlayerStatus;

    @Column({ type: 'datetime' })
    fromDate: Date;
    @Column({ type: 'datetime' })
    toDate: Date;

    @Column("int")
    startingPrice: number

    @OneToMany(type => MarketBid, m => m.marketPlayer)
    bids: MarketBid[]

    // Finished fields

    @Column("int", {nullable: true})
    finalPrice: number

    @Column('datetime', {nullable: true})
    resolvedDate: Date;
}


export enum MarketBidStatus {
    PLACED  = "PLACED",
    OVERBID  = "OVERBID",
    DELETED  = "DELETED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

@Entity()
export class MarketBid {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => MarketPlayer)
    marketPlayer: MarketPlayer;

    @ManyToOne(type => League)
    league: League;

    @ManyToOne(type => Team)
    team: Team;

    @ManyToOne(type => User, {nullable: true})
    user: User;

    @Column('int')
    amount: number;

    @Column({
        type: "varchar",
        default: MarketBidStatus.PLACED
    })
    status: MarketBidStatus;

    @CreateDateColumn()
    createdDate: Date;

    @Column('datetime', {nullable: true})
    resolvedDate: Date;

}
