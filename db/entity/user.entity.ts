import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {
        unique: true
    })
    username: string;

    //@Column('varchar', {
    //    unique: true
    //})
    //email: string;

    @Column('varchar')
    password: string;

    @OneToMany(type => Team, team => team.user)
    teams: Team[];
}

