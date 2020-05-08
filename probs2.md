

const probabilities = [
    {n:35,s:"p",pl:1},
    {n:40,s:"r",pl:1,
        c: [
            {n:35,s:"r-ok",pl:2},
            {n:40,s:"r-fail",pl:2}
        ]
    },
];

function calc(probs) {
    const sum = probs.map(p=>p.n).reduce((a,b) => a + b);

    const res = [];

    for (let i = 0; i < probs.length; i++) {
        const prob = probs[i];
        const p = prob.n / sum;
        if (prob.hasOwnProperty("c")) {
            const children = calc(prob.c);
            for (let j=0; j<children.length; j++) {
                const c = children[j];
                const cp = p*c.p;
                console.log(p, c.p, cp);
                res.push({...c, p: cp});
            }
        } else {
            console.log(p);
            res.push({...prob, p});
        }
    }
    return res;
}

let a = calc(probabilities);
console.log(a);
