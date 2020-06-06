

# TODO

TODO: Create UserPrivateData to store password

# Cron processes

http://localhost:3000/api/freezelineups
http://localhost:3000/api/processmatches


# Next.js

## Fetch props directly from the Database?!?! New Hooks in Next.js 9.3!

https://www.youtube.com/watch?v=QABkof8ygzI

## Next.js api routes

https://flaviocopes.com/nextjs-api-routes/

# TypeORM

https://github.com/typeorm/typeorm/tree/master/docs

# Formik

https://jaredpalmer.com/formik/docs/overview

TODO: Must be added: https://github.com/stackworx/formik-material-ui

https://www.youtube.com/watch?v=3sXYK60T6Us

## formik material-ui

https://stackworx.github.io/formik-material-ui/docs/guide/getting-started

# Fix styles of material-ui

https://material-ui.com/guides/server-rendering/#reference-implementations

https://github.com/mui-org/material-ui/tree/master/examples/nextjs
https://github.com/mui-org/material-ui/blob/master/examples/nextjs/src/theme.js

# Fix typeorm migrations

https://github.com/typeorm/typeorm/issues/5087

# Fix positions

position_id 	position_desc
GK 	Goalkeepers
DF 	Defenders
MF 	Midfielders
FD 	Defenders



# Material-UI theme generator

https://cimdalli.github.io/mui-theme-generator/


# Material-UI icons

https://material-ui.com/components/material-icons/


# SCSS

https://sass-lang.com/documentation/at-rules/control/for


# Fix auth

add withAuthSSP to all pages
and withAuthAPI to API pages

# Restart league

delete from match_step;
delete from match where leagueId = 8;
update league set status = "ORGANIZING" where id = 8;

update match set matchDate = date('now', '-2 day'), status="SCHEDULED" where leagueId = 8;

# calculate classification

select
count(*),
SUM(CASE WHEN homeId=3 THEN homePoints ELSE awayPoints END) as points, 
SUM(CASE WHEN homeId=3 THEN resultHome ELSE resultAway END) as scored, 
SUM(CASE WHEN awayId=3 THEN resultHome ELSE resultAway END) as against
from match
where leagueId = 8
and status = "FINISHED"
and (homeId = 3 or awayId = 3);

export async function calculateClassification(team:Team, league:League):Promise<Match[]> {
    const db = await new Database().getManager();
    const matchRepository = db.getRepository(Match);
    return matchRepository.createQueryBuilder("match")
        .select(`
            SUM(CASE WHEN match.home.id=:teamId THEN match.homePoints ELSE match.awayPoints END) as points,
            SUM(CASE WHEN match.home.id=:teamId THEN match.resultHome ELSE match.resultAway END) as scored,
            SUM(CASE WHEN match.away.id=:teamId THEN match.resultHome ELSE match.resultAway END) as against
        `)
        .where("match.league.id = :leagueId", {leagueId: league.id})
        .andWhere("match.home.id = :teamId or match.away.id = :teamId", {teamId: team.id})
        .getRawOne();
}


# Moment.js

https://momentjs.com/docs/


# League States

League > Season > Round > Match

Admin crea la liga:
League.ORGANIZING
- Se pueden añadir equipos


Admin comienza la liga:
League.ONGOING
- Se bloquean los equipos, no se pueden añadir más


    Admin crea una temporada:
    - No se pueden crear otras temporadas
    - Crear jornadas y partidos.
    - Asignar la temporada a la liga

    Se termina la temporada:
    - LEAGUE.ORGANIZING

Admin cierra la liga:
Leagues.CLOSED
- Solo si no hay temporadas en marcha


# moment.js issue

https://github.com/moment/moment/issues/5416

I've found the same problem for Spanish 'es'. (Found this issue already open)

Tomorrow at 2pm, works fine: "mañana a las 14:00"
Today at 2pm, works fine: "hoy a las 14:00"
Last Thursday at 2pm, works fine: "el jueves pasado a las 14:00"

