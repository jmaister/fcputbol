import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn,
    ManyToMany,
    JoinTable
} from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';

@Entity()
export class Lineup {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(type=> Player)
    @JoinTable()
    players: Player[];
}

