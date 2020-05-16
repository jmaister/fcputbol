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
import { Round } from './round.entity';

export enum MatchStatus {
    SCHEDULED = "SCHEDULED",
    READY = "READY",
    FINISHED = "FINISHED",
}

@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Team)
    home: Team;
    @ManyToOne(type => Team)
    away: Team;

    @Column({
        type: "varchar",
        default: MatchStatus.SCHEDULED
    })
    status: MatchStatus;

    @ManyToOne(type => Round, r => r.matches, {nullable: true})
    round: Round;

    // Fields to set on READY

    @ManyToOne(type => Lineup)
    homeLineup?: Lineup;
    @ManyToOne(type => Lineup)
    awayLineup?: Lineup;

    // Fields to set on FINISHED

    // Date when the match is processed
    @Column({ type: 'datetime', nullable: true })
    playDate: Date;

    @OneToMany(type => MatchStep, matchStep => matchStep.match)
    matchSteps?: MatchStep[];

    @Column({ type: 'int', nullable: true })
    stepsCount: number;

    @Column({ type: 'int', nullable: true })
    resultHome: number;
    @Column({ type: 'int', nullable: true })
    resultAway: number;

    @Column({ type: 'int', nullable: true })
    homePoints: number;
    @Column({ type: 'int', nullable: true })
    awayPoints: number;

    @Column({ type: 'boolean', nullable: true })
    homeWin: boolean;
    @Column({ type: 'boolean', nullable: true })
    awayWin: boolean;
    @Column({ type: 'boolean', nullable: true })
    draw: boolean;
}


@Entity()
export class MatchStep {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Match, match => match.matchSteps)
    match: Match;

    // Minute of the match
    @Column({ type: 'int' })
    t: number;
    // Step number, it is possible to have more than one step in a minute
    @Column({ type: 'int' })
    stepNumber: number;

    @Column({ type: 'int' })
    currentGoalHome: number;
    @Column({ type: 'int' })
    currentGoalAway: number;

    @ManyToOne(type => Player, {nullable: true})
    player: Player;
    @ManyToOne(type => Player, {nullable: true})
    player2: Player;

    @Column('varchar', {nullable: true})
    state: string;

    @Column('boolean', {nullable: true})
    ballOnA: boolean;

    @Column('varchar')
    comment: string;


}
