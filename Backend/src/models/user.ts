import PlayerStats from "./playerStats.js";

export default class User{
    id: string;
    username: string;
    stats: PlayerStats;

    constructor(id: string, username: string){
        this.id = id;
        this.username = username;
        this.stats = new PlayerStats(this.id);

    }
}