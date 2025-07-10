class MainModel {
    constructor() {
        this.gameInfo = new GameInfo();
        this.meta = new MetaInfo();
    }
}

class MetaInfo {
    constructor() {
        this.commentators = "";
        this.fightRule = "";
        this.notation = "";
        this.sponsor = "";
        this.prizepool = "";
        this.title = "";
        this.url = "";
        this.playersCount = 0;
    }
}

class GameInfo {
    constructor() {
        this.player1 = new Player();
        this.player2 = new Player();
    }
    get p1Wins() {
        return this.player1.counter;
    }
    get p2Wins() {
        return this.player2.counter;
    }
}

class Player {
    constructor() {
        this.name = "";
        this.country = "";
        this.character = "";
        this.sponsor = "";
        this.counter = 0;
        this.tag = "";
    }
    get fullName() {
        return this.tag + " | " + this.name;
    }
}