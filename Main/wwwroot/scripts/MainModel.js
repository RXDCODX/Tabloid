class MainModel {
    GameInfo = new GameInfo();
    Meta = new MetaInfo();
}

class MetaInfo {
    Commentators;
    FightRule;
    Notation;
    Sponsor;
    Prizepool;
    Title;
    Url;
    PlayersCount;
}

class GameInfo {
    Player1 = new Player();
    Player2;
    get P1Wins() {
        return Player1.Counter;
    }
    get P2Wins() {
        return Player2.Counter;
    }
}

class Player {
    Name;
    Country;
    Character;
    Sponsor;
    Counter;
    get FullName() {
        return this.Tag + " | " + this.Name;
    }
}