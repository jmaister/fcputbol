
# User
id
name
email

# Player
id
name
...stats

# Team
id
name
@user

# TeamPlayers
id
@team
@player

# League
id
name
admin:@user
started_on
shareable_code
deadline_hour_utc

# LeagueUsers
id
@league
@team

# Match
id
home@team
away@team
date_time
result_home
result_away


# MatchSteps
id
@match
t
player
player2
state
ballOnA
comment
