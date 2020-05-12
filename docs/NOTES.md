
# Next.js

## Fetch props directly from the Database?!?! New Hooks in Next.js 9.3!

https://www.youtube.com/watch?v=QABkof8ygzI

## Next.js api routes

https://flaviocopes.com/nextjs-api-routes/

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

update match set matchDate = date('now', '-1 day') where leagueId = 8;

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


# Moment.js

https://momentjs.com/docs/

