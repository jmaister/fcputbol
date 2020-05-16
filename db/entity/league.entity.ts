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
import { Season } from './season.entity';

export enum LeagueStatus {
    ORGANIZING  = "ORGANIZING",
    ONGOING = "ONGOING",
    FINISHED = "FINISHED",
}

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

    @Column({
        type: "varchar",
        default: LeagueStatus.ORGANIZING
    })
    status: LeagueStatus;

    @ManyToMany(type => Team)
    @JoinTable()
    teams: Team[];

    @OneToMany(type => Season, s => s.league)
    seasons: Season[]

    @ManyToOne(type => Season, {nullable: true})
    currentSeason: Season

}
