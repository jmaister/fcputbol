import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';

import { Team } from './team.entity';
import { League } from './league.entity';
import { Season } from './season.entity';

@Entity()
export class Classification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => League)
    league: League;

    @ManyToOne(type => Season)
    season: Season;

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
