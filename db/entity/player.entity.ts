
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm';

import { Team } from './team.entity';

export enum Positions {
    gk = "gk",
    def = "def",
    mid = "mid",
    fw = "fw",
}

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

    @Column('int')
    num: number;

    @Column('varchar')
    position: string;

    @Column('double')
    save: number;
    @Column('double')
    defense: number;
    @Column('double')
    pass: number;
    @Column('double')
    dribble: number;
    @Column('double')
    shot: number;
}

