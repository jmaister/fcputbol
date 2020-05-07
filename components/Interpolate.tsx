import React from 'react';

export interface InterpolateParams {
    str: string
    values: any
    components: any
}

export default function Interpolate({str, values, components}: InterpolateParams) {

    let formatted = [] as any[];
    while (str.indexOf('{') > 0) {
        const i = str.indexOf('{');
        const f = str.indexOf('}', i);
        const prop = str.substring(i + 1, f);
        const Component = components[prop];
        const intpl = <Component {...values} />;
        formatted.push(<span>{str.substring(0, i)}</span>);
        formatted.push(intpl)
        str = str.substring(f + 1);
    }
    formatted.push(str);

    return (
        <span>{formatted.map((f,i)=>{
            return <span key={i}>{f}</span>
        })}</span>
    )
}
