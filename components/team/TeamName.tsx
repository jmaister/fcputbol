import { Team } from "db/entity/team.entity";
import { User } from "db/entity/user.entity";


interface TeamName {
    team:Team
    user?:User
}

export default function TeamName({team, user}:TeamName) {
    let username = null;
    if (team.user && team.user.username) {
        username = team.user.username;
    } else if (user && user.username) {
        username = user.username;
    }

    return (
        <span className="teamname">
            <span className={'jersey jersey-' + team.jersey_color}>{team.name}</span>
            {username != null ? <span className={'username'}>@{username}</span>: null}
        </span>
    )
}
