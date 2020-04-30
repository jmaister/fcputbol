import { Team } from '../../db/entity/team.entity';

import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ChangeEvent } from 'react';


interface TeamSelectParams {
    id: string
    teams: Team[]
    value: string
    setValue: Function
    label: string
}

export default function TeamSelect({ id, teams, value, setValue, label }: TeamSelectParams) {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            formControl: {
                margin: theme.spacing(1),
                minWidth: 230,
            },
            selectEmpty: {
                marginTop: theme.spacing(2),
            },
        }),
    );

    const classes = useStyles();

    const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
        setValue(event.target.value as string);
    };

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id={id + '-label'}>{label}</InputLabel>
            <Select
                labelId={id + '-label'}
                id={id}
                value={value}
                onChange={handleChange}
                label={label}
            >
                {teams.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
