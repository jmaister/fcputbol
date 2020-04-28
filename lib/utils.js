

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
