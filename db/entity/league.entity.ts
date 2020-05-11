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
import { Match } from './match.entity';

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

    @ManyToMany(type => Team)
    @JoinTable()
    teams: Team[];

    @Column({
        type: "varchar",
        default: LeagueStatus.ORGANIZING
    })
    status: LeagueStatus;

    @OneToMany(type => Match, m => m.league)
    matches: Match[]

    @Column("int", {nullable: true})
    currentRound: number;

    @Column("int", {nullable: true})
    roundCount: number;

}
