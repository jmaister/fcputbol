
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    OneToOne
} from 'typeorm';

import { User } from './user.entity';
import { Player } from './player.entity';
import { Lineup } from './lineup.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    jersey_color: string;

    @ManyToOne(type => User, user => user.teams)
    user: User;

    @OneToMany(type => Player, player => player.team)
    players: Player[];

    @ManyToOne(type => Lineup)
    currentLineup: Lineup;

}

