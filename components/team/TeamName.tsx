import { Team } from "db/entity/team.entity";
import { User } from "db/entity/user.entity";
import Link from "next/link";


interface TeamName {
    team:Team
    user?:User
    isLink?: boolean
}

export default function TeamName({team, user, isLink=true}:TeamName) {
    let username = null;
    if (team.user && team.user.username) {
        username = team.user.username;
    } else if (user && user.username) {
        username = user.username;
    }

    const label = (
        <span className="teamname">
            <span className={'jersey jersey-' + team.jersey_color}>{team.name}</span>
            {username != null ? <span className="username">@{username}</span>: null}
        </span>
    );

    if (isLink) {
        return <Link href={'team/' + team.id}><a>{label}</a></Link>
    } else {
        return label;
    }
}
