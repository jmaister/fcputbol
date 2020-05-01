import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { Team } from './team.entity';
import { Player } from './player.entity';

@Entity()
export class Lineup {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Team, team => team.lineup)
    @JoinColumn()
    team: Team;

    @ManyToOne(type=> Player)
    gk: Player[];
    @ManyToOne(type=> Player)
    def: Player[];
    @ManyToOne(type=> Player)
    mid: Player[];
    @ManyToOne(type=> Player)
    fw: Player[];

}

