
export function range(n): number[] {
    return Array(n).fill(null).map((_,i) => i);
};

export function randomIntInterval(min:number, max:number): number {
    // min and max include
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function randomDoubleInterval(min:number, max:number): number {
    return Math.random() * (max - min) + min;
};

export function randomElement<T>(arr: T[]): T {
    return arr[randomIntInterval(0, arr.length-1)];
};

function shuffle<T>(array:T[]): T[] {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

export function sample<T>(arr:T[], n=1): T[] {
    const copy = [...arr];
    shuffle(copy);
    return copy.slice(0, n);
}

export function format(s:string, args:object): string {
    let formatted = s;
    for (let arg in args) {
        let value = args[arg];
        if (value && (arg === "player" || arg === "player2")) {
            value = '(' + value.num + ') ' + value.name + ' ' + value.surname;
        }
        formatted = formatted.replace("{" + arg + "}", "<b>" + value + "</b>");
    }
    return formatted;
};
