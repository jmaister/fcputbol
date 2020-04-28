import fs from 'fs';
import { randomElement } from '../lib/utils';

class RandomData {
    constructor() {
        this._names = fs.readFileSync('data/names.es.txt').toString().split('\n');
        this._surnames = fs.readFileSync('data/surnames.es.txt').toString().split('\n');
    }

    getName() {
        return randomElement(this._names);
    }

    getSurname() {
        return randomElement(this._surnames);
    }
}

const instance = new RandomData();
Object.freeze(instance);

export default instance;
