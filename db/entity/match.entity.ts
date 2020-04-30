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

@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => MatchStep, matchStep => matchStep.match)
    matchSteps: MatchStep[];

    @ManyToOne(type => Team)
    home: Team;
    @ManyToOne(type => Team)
    away: Team;

    @Column({ type: 'int' })
    resultHome: number;
    @Column({ type: 'int' })
    resultAway: number;

    @CreateDateColumn()
    createdDate: Date;
}


@Entity()
export class MatchStep {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Match, match => match.matchSteps)
    match: Match;

    @Column({ type: 'int' })
    t: number;

    @ManyToOne(type => Player)
    player: Player;
    @ManyToOne(type => Player)
    player2: Player;

    state: string;

    ballOnA: boolean;

    comment: string;
}
