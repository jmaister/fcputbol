import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn,
    ManyToMany,
    JoinTable
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { Classification } from './classification.entity';
import { Round } from './round.entity';
import { League } from './league.entity';

export enum SeasonStatus {
    SCHEDULED = "SCHEDULED",
    FINISHED = "FINISHED",
}

@Entity()
export class Season {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string

    @Column("int")
    seasonNumber: number

    @ManyToOne(type => League, l => l.seasons)
    league: League;

    @OneToMany(type => Round, r => r.season)
    rounds: Round[]

    @OneToMany(type => Classification, c => c.season)
    classifications: Classification[];

    @Column({
        type: "varchar",
        default: SeasonStatus.SCHEDULED
    })
    status: SeasonStatus;

    @Column("int", {nullable: true})
    currentRound: number;

    @Column("int", {nullable: true})
    roundCount: number;

}
