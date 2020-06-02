
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';

import { Team } from './team.entity';

export enum Positions {
    gk = "gk",
    def = "def",
    mid = "mid",
    fw = "fw",
}

// export const PlayerStat = ['save', 'defense', 'pass', 'dribble', 'shot'];

export enum PlayerStat {
    SAVE = 'SAVE',
    DEFENSE = 'DEFENSE',
    PASS = 'PASS',
    DRIBBLE = 'DRIBBLE',
    SHOT = 'SHOT',
}

export const PlayerStats = [PlayerStat.SAVE, PlayerStat.DEFENSE, PlayerStat.PASS, PlayerStat.DRIBBLE, PlayerStat.SHOT];

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

@Entity()
export class PlayerPoints {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Player)
    user: Player;

    @Column('double')
    points: number;

    @Column("varchar")
    status: PlayerStat;

    @CreateDateColumn()
    createdDate: Date;

}

