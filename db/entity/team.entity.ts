
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm';

import { User } from './user.entity';

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
}

