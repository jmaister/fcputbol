import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';

import { Team } from './team.entity';
import { Player } from './player.entity';
import { Lineup } from './lineup.entity';
import { League } from './league.entity';

export enum MatchStatus {
    SCHEDULED = "SCHEDULED",
    READY = "READY",
    FINISHED = "FINISHED",
}

@Entity()
export class Classification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => League)
    league: League;

    @ManyToOne(type => Team)
    team: Team;

    @CreateDateColumn()
    createdDate: Date;

    @Column('int')
    points: number;

    @Column('int')
    goalsScored: number;
    @Column('int')
    goalsAgainst: number;

    //TODO: match wins, draws, loses
}
