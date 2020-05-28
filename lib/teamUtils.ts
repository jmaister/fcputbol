import { Lineup } from "db/entity/lineup.entity";
import { Team } from "db/entity/team.entity";
import { sortPlayersByPosition } from "./playerUtils";
import { Player } from "db/entity/player.entity";


export const jerseyColors = [
    {label: "Rojo", value: "red"},
    {label: "Azúl", value: "blue"},
    {label: "Verde", value: "green"},
    {label: "Naranja", value: "orange"},
    {label: "Amarillo", value: "yellow"},
    {label: "Azúl claro", value: "lightblue"},
    {label: "Marrón", value: "brown"},
];

export class LineupWrapper {
    players: Player[];
    lineupIds: number[];

    constructor(team: Team, lineup: Lineup) {
        this.players = team.players;
        this.lineupIds = lineup.players.map(p=>p.id);
    }

    getLineupIds(): number[] {
        return this.lineupIds;
    }

    getBenchIds(): number[] {
        const teamIds = this.players.map(p=>p.id);
        return teamIds.filter(p => !this.lineupIds.includes(p));
    }

    getBenchPlayers(): Player[] {
        const bench = this.getBenchIds();
        return this.players.filter(p=>bench.includes(p.id));
    }

    getSortedLineup() {
        const lineupPlayers = this.players.filter(p => this.lineupIds.includes(p.id));
        return sortPlayersByPosition(lineupPlayers);
    }

    getSortedBench() {
        return sortPlayersByPosition(this.getBenchPlayers());
    }

    exchangePlayer(inId: number, outId: number) {
        if (!this.lineupIds.includes(inId) && this.lineupIds.includes(outId) && this.getBenchIds().includes(inId)) {
            this.lineupIds = this.lineupIds.filter(i=>i != outId);
            this.lineupIds.push(inId);
        } else {
            throw new Error('Invalid player IDs');
        }
    }
}
