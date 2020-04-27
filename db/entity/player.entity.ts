
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm';

import { Team } from './team.entity';

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    surname: string;

    @ManyToOne(type => Team, team => team.players)
    team: Team;

    save: number;
    defense: number;
    pass: number;
    dribble: number;
    shot: number;
}

