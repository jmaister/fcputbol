
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

export const PlayerStat = ['save', 'defense', 'pass', 'dribble', 'shot'];

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

    // Nullable for the new players in the market
    @Column('int', {nullable: true})
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

