import fs from 'fs';
import { randomElement } from './utils';

class RandomData {
    _names: string[];
    _surnames: string[];

    constructor() {
        this._names = fs.readFileSync('data/names.es.txt').toString().split('\n');
        this._surnames = fs.readFileSync('data/surnames.es.txt').toString().split('\n');
    }

    getName():string {
        return randomElement(this._names);
    }

    getSurname():string {
        return randomElement(this._surnames);
    }
}

const instance = new RandomData();
Object.freeze(instance);

export default instance;
