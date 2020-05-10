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
import { User } from './user.entity';

@Entity()
export class League {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string

    @Column("varchar")
    code: string

    @ManyToOne(type => User)
    admin: User;

    @ManyToMany(type => Team)
    @JoinTable()
    teams: Team[];
}
