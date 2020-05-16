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
import { Match } from './match.entity';
import { Season } from './season.entity';

export enum RoundStatus {
    SCHEDULED = "SCHEDULED",
    FINISHED = "FINISHED",
}

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdDate: Date;

    @Column({ type: 'int' })
    roundNumber: number;
    @Column({ type: 'int' })
    roundCount: number;

    @ManyToOne(type => Season, l => l.rounds)
    season: Season

    // Expected date to play
    @Column({ type: 'datetime' })
    roundDate: Date;

    @Column({ type: 'datetime' })
    freezeLineupDate: Date;

    @Column({
        type: "varchar",
        default: RoundStatus.SCHEDULED
    })
    status: RoundStatus;

    @OneToMany(type => Match, m => m.round)
    matches: Match[]

    // Fields to set on FINISHED

    // Date when the round is processed
    @Column({ type: 'datetime', nullable: true })
    finishDate: Date;

}
