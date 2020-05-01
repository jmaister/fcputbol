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
