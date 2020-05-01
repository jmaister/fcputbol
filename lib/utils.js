

export function range(n) {
    return Array(n).fill().map((_,i) => i);
};

export function randomIntInterval(min, max) {
    // min and max include
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function randomDoubleInterval(min, max) {
    return Math.random() * (max - min) + min;
};

export function randomElement(arr) {
    return arr[randomIntInterval(0, arr.length-1)];
};

function shuffle(array) {
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

export function sample(arr, n=1) {
    const copy = [...arr];
    shuffle(copy);
    return copy.slice(0, n);
}
