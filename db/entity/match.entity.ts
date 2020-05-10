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
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => MatchStep, matchStep => matchStep.match)
    matchSteps: MatchStep[];

    @Column({ type: 'int' })
    stepsCount: number;

    @ManyToOne(type => Team)
    home: Team;
    @ManyToOne(type => Team)
    away: Team;

    @ManyToOne(type => Lineup)
    homeLineup: Lineup;
    @ManyToOne(type => Lineup)
    awayLineup: Lineup;

    @Column({ type: 'int' })
    resultHome: number;
    @Column({ type: 'int' })
    resultAway: number;

    @CreateDateColumn()
    createdDate: Date;

    @Column({ type: 'datetime' })
    playDate: Date;

    @ManyToOne(type => League, l => l.matches)
    league?: League;

    @Column({
        type: "varchar",
        default: MatchStatus.SCHEDULED
    })
    status: MatchStatus;
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
