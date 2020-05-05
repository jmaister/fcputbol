
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { ChangeEvent } from "react";
import MenuItem from "@material-ui/core/MenuItem";


interface JerseySelectParams {
    id: string
    name: string
    value: string
    label: string
    onChange: any
}

export default function JerseySelect({ id, name, value, label, onChange }: JerseySelectParams) {

    const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
        //setValue(event.target.value as string);
    };

    const colors = [
        "red",
        "blue",
        "green",
        "orange",
        "yellow",
        "lightblue",
        "brown",
    ];

    /*
    {colors.map(c => {
        return <MenuItem key={c} value={c} className={'jersey_' + c}>
            {c}
        </MenuItem>;
    })}
    */


    return (
        <FormControl>
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <Select
                value={value}
                onChange={onChange}
                inputProps={{
                    name: name,
                    id: id,
                }}
                className="jersey-select"
            >
                <option aria-label="None" value="" />
                {colors.map(c => {
                    return <option key={c} value={c} className={'jersey_' + c}>
                        {c}
                    </option>;
                })}
            </Select>
        </FormControl>
    );
}
