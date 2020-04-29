
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';

import { User } from './user.entity';
import { Player } from './player.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {
        unique: true
    })
    name: string;

    @ManyToOne(type => User, user => user.teams)
    user: User;

    @OneToMany(type => Player, player => player.team)
    players: Player[];

}

