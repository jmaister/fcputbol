import { Team } from '../../db/entity/team.entity';

import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { ChangeEvent } from 'react';
import TeamName from './TeamName';


interface TeamSelectParams {
    id: string
    teams: Team[]
    value: string
    setValue: Function
    label: string
}

export default function TeamSelect({ id, teams, value, setValue, label }: TeamSelectParams) {

    const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
        setValue(event.target.value as string);
    };

    return (
        <FormControl className="teamselect-formcontrol">
            <InputLabel id={id + '-label'}>{label}</InputLabel>
            <Select
                labelId={id + '-label'}
                id={id}
                value={value}
                onChange={handleChange}
                label={label}
            >
                {teams.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                        <TeamName team={t} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
