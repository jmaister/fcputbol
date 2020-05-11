

# League

* Create league (/league)
    * Name
    * Send invitation
    * League create is the admin
    * create a code
* link to signup (/leaguesignup/[code])
    * sign to league
    * select team from availables
* Start league (/league/[id])
    * Create matches with due date
    * If admin, can start
    * If not admin, wait message

League will play matches automatically when due date arrives.

Add status
Add current match day - jornada actual

## League states

ORGANIZING - ORGANIZANDO
    - Can add teams
ONGOING - EN MARCHA
    - Create matches, set matchDayCount and currentMatchDay
    - Play
    - Once all matches in a match day are finished, next match day is shown
FINISHED - FINALIZADO
    - view only

# Match

Add match day - Jornada
Add status

## Match states

SCHEDULED - PREVISTO
    - no need for lineup

READY - PREPARADO
    - Current lineup is assigned

FINISHED - FINALIZADO
    - Play, save steps and score


# TODO

* Match: add play date
* League: add play hour (utc)
* League: sort by round
 
