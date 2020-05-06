import React from 'react';

export interface InterpolateParams {
    str: string
    values: any
    components: any
}

export default function Interpolate({str, values, components}: InterpolateParams) {

    let formatted = [] as any[];
    while (str.indexOf('{')>0) {
        let i = str.indexOf('{');
        let f = str.indexOf('}', i);
        const prop = str.substring(i+1, f);
        const Component = components[prop];
        const intpl = <Component {...values} />;
        formatted.push(<span>{str.substring(0, i)}</span>);
        formatted.push(intpl)
        str = str.substring(f+1);
    }
    formatted.push(str);

    console.log("formt", formatted);

    return (
        <span>{formatted.map((f,i)=>{
            return <span key={i}>{f}</span>
        })}</span>
    )
}


import React from 'react';

export default function Show(props:any) {
    return (
        <span>
        {Object.keys(props).map((p:any,i:number) => {
            return <span key={i}>{props[p]}</span>
        })}
        </span>
    )

}


import React from 'react';
import './App.css';
import Interpolate from './Interpolate';
import Show from './Show';

function App() {
  const values = {
    t: "All F.C"
  };
  const components = {
    t: Show
  };

  return (
    <div className="App">
      <header className="App-header">
          <Interpolate str="el equipo {t} gana" values={values} components={components} />
      </header>
    </div>
  );
}

export default App;



