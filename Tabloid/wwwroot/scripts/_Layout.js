"use strict";

const bindings = {};
window.bindings = bindings;
class Observable {
    constructor(value) {
        this._listeners = [];
        this._value = value;
    }

    notify() {
        this._listeners.forEach(listener => listener(this._value));
    }

    subscribe(listener) {
        this._listeners.push(listener);
    }

    get value() {
        return this._value;
    }

    set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.notify();

            if (createMainModelFromBindings != null && !window.isSignalrUpdate) {
                if (connection != null) {
                    var model = createMainModelFromBindings(bindings);
                    connection.invoke("Update", model);
                }
            }
        }
    }
}

class Computed extends Observable {
    constructor(value, deps) {
        super(value());
        const listener = () => {
            this._value = value();
            this.notify();
        }
        deps.forEach(dep => dep.subscribe(listener));
    }

    get value() {
        return this._value;
    }

    set value(_) {
        throw "Cannot set computed property";
    }
}

const bindValue = (input, observable) => {
    if (!input.value && input.value !== "") {
        input.innerText = observable.value;
        observable.subscribe(() => input.innerText = observable.value);
    } else {
        input.value = observable.value;
        observable.subscribe(() => input.value = observable.value);
    }
    input.onkeyup = () => observable.value = input.value;
};

const applyBindings = () => {
    document.querySelectorAll("[data-bind]").forEach(elem => {
        const obs = bindings[elem.getAttribute("data-bind")];
        bindValue(elem, obs);
    });
};

const addWinnerTagLeftSide = (field) => {
    const addition = " [L]";
    const addition2 = " [W]";
    if (bindings[field].value.includes(addition) || bindings[field].value.includes(addition2)) {
        bindings[field].value = bindings[field].value.replace(addition, "");
        bindings[field].value = bindings[field].value.replace(addition2, "");
    }

    bindings[field].value = bindings[field].value + addition2;
};

const addLooserTagLeftSide = (field) => {
    const addition = " [L]";
    const addition2 = " [W]";
    if (bindings[field].value.includes(addition) || bindings[field].value.includes(addition2)) {
        bindings[field].value = bindings[field].value.replace(addition, "");
        bindings[field].value = bindings[field].value.replace(addition2, "");
    }
    bindings[field].value = bindings[field].value + addition;
};

const addLooserTagRightSide = (field) => {
    const addition = "[L] ";
    const addition2 = "[W] ";
    if (bindings[field].value.includes(addition) || bindings[field].value.includes(addition2)) {
        bindings[field].value = bindings[field].value.replace(addition, "");
        bindings[field].value = bindings[field].value.replace(addition2, "");
    }
    bindings[field].value = addition + bindings[field].value;
};

const addWinnerTagRightSide = (field) => {
    const addition = "[L] ";
    const addition2 = "[W] ";
    if (bindings[field].value.includes(addition) || bindings[field].value.includes(addition2)) {
        bindings[field].value = bindings[field].value.replace(addition, "");
        bindings[field].value = bindings[field].value.replace(addition2, "");
    }
    bindings[field].value = addition2 + bindings[field].value;
};

const increment = (field) => {
    var value = bindings[field].value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[field].value = value + 1;
    }
}

const decrement = (field) => {
    var value = bindings[field].value;

    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[field].value = value - 1;
    }
}

const zeroing = (field) => {
    var value = bindings[field].value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[field].value = 0;
    }
}

window.addWinnerTagLeftSide = addWinnerTagLeftSide;
window.addLooserTagLeftSide = addLooserTagLeftSide;
window.addLooserTagRightSide = addLooserTagRightSide;
window.addWinnerTagRightSide = addWinnerTagRightSide;
window.increment = increment;
window.decrement = decrement;
window.zeroing = zeroing;

const swapNames = () => {
    connection.invoke('SwapNames');
}

const swapPlayers = () => {
    connection.invoke('SwapPlayers');
}

const swapCountry = () => {
    connection.invoke('SwapCountry');
}

const reset = () => {
    connection.invoke('Reset');
}

const updateModel = (mainModel) => {
    bindings.gameInfoPlayer1Name.value = mainModel.gameInfo.player1.name;
    bindings.gameInfoPlayer1Country.value = mainModel.gameInfo.player1.country;
    bindings.gameInfoPlayer1Character.value = mainModel.gameInfo.player1.character;
    bindings.gameInfoPlayer1Sponsor.value = mainModel.gameInfo.player1.sponsor;
    bindings.gameInfoPlayer1Counter.value = mainModel.gameInfo.player1.counter;
    bindings.gameInfoPlayer1Tag.value = mainModel.gameInfo.player1.tag;

    bindings.gameInfoPlayer2Name.value = mainModel.gameInfo.player2.name;
    bindings.gameInfoPlayer2Country.value = mainModel.gameInfo.player2.country;
    bindings.gameInfoPlayer2Character.value = mainModel.gameInfo.player2.character;
    bindings.gameInfoPlayer2Sponsor.value = mainModel.gameInfo.player2.sponsor;
    bindings.gameInfoPlayer2Counter.value = mainModel.gameInfo.player2.counter;
    bindings.gameInfoPlayer2Tag.value = mainModel.gameInfo.player2.tag;

    bindings.metaCommentators.value = mainModel.meta.commentators;
    bindings.metaFightRule.value = mainModel.meta.fightRule;
    bindings.metaNotation.value = mainModel.meta.notation;
    bindings.metaSponsor.value = mainModel.meta.sponsor;
    bindings.metaPrizepool.value = mainModel.meta.prizepool;
    bindings.metaTitle.value = mainModel.meta.title;
    bindings.metaUrl.value = mainModel.meta.url;
    bindings.metaPlayersCount.value = mainModel.meta.playersCount;
};

const createMainModelFromBindings = (bindings) => {
    const mainModel = new MainModel();

    mainModel.gameInfo.player1 = new Player();
    mainModel.gameInfo.player1.name = bindings.gameInfoPlayer1Name.value;
    mainModel.gameInfo.player1.country = bindings.gameInfoPlayer1Country.value;
    mainModel.gameInfo.player1.character = bindings.gameInfoPlayer1Character.value;
    mainModel.gameInfo.player1.sponsor = bindings.gameInfoPlayer1Sponsor.value;
    mainModel.gameInfo.player1.counter = bindings.gameInfoPlayer1Counter.value;
    mainModel.gameInfo.player1.tag = bindings.gameInfoPlayer1Tag.value;

    mainModel.gameInfo.player2 = new Player();
    mainModel.gameInfo.player2.name = bindings.gameInfoPlayer2Name.value;
    mainModel.gameInfo.player2.country = bindings.gameInfoPlayer2Country.value;
    mainModel.gameInfo.player2.character = bindings.gameInfoPlayer2Character.value;
    mainModel.gameInfo.player2.sponsor = bindings.gameInfoPlayer2Sponsor.value;
    mainModel.gameInfo.player2.counter = bindings.gameInfoPlayer2Counter.value;
    mainModel.gameInfo.player2.tag = bindings.gameInfoPlayer2Tag.value;

    mainModel.meta.commentators = bindings.metaCommentators.value;
    mainModel.meta.fightRule = bindings.metaFightRule.value;
    mainModel.meta.notation = bindings.metaNotation.value;
    mainModel.meta.sponsor = bindings.metaSponsor.value;
    mainModel.meta.prizepool = bindings.metaPrizepool.value;
    mainModel.meta.title = bindings.metaTitle.value;
    mainModel.meta.url = bindings.metaUrl.value;
    mainModel.meta.playersCount = bindings.metaPlayersCount.value;

    return mainModel;
}

window.createMainModelFromBindings = createMainModelFromBindings;

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://" + window.location.host + "/hub",
        {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
    .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
            return 1000;
        }
    })
    .configureLogging(signalR.LogLevel.Trace)
    .build();

window.connection = connection;

async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.on("Update", function (model) {
    console.log(model);
    window.isSignalrUpdate = true;
    updateModel(model);
    window.isSignalrUpdate = false;
});

connection.onclose(async () => {
    await start();
});

const getFullName = (player) => {

    if (player == 1) {
        if (bindings.gameInfoPlayer1Sponsor.value == "" || bindings.gameInfoPlayer1Sponsor.value == undefined) {
            return bindings.gameInfoPlayer1Name.value;
        }

        return `${bindings.gameInfoPlayer1Sponsor.value} | ${bindings.gameInfoPlayer1Name.value}`;
    }

    if (player == 2) {
        if (bindings.gameInfoPlayer2Sponsor.value == "" || bindings.gameInfoPlayer2Sponsor.value == undefined) {
            return bindings.gameInfoPlayer2Name.value;
        }

        return `${bindings.gameInfoPlayer2Name.value} | ${bindings.gameInfoPlayer2Sponsor.value}`;
    }
}

const app = () => {
    // ������� observable �������� ��� ������� ���� ������ MainModel
    bindings.gameInfoPlayer1Name = new Observable("");
    bindings.gameInfoPlayer1Country = new Observable("ru");
    bindings.gameInfoPlayer1Character = new Observable("");
    bindings.gameInfoPlayer1Sponsor = new Observable("");
    bindings.gameInfoPlayer1Counter = new Observable(0);
    bindings.gameInfoPlayer1Tag = new Observable("");

    bindings.gameInfoPlayer2Name = new Observable("");
    bindings.gameInfoPlayer2Country = new Observable("ru");
    bindings.gameInfoPlayer2Character = new Observable("");
    bindings.gameInfoPlayer2Sponsor = new Observable("");
    bindings.gameInfoPlayer2Counter = new Observable(0);
    bindings.gameInfoPlayer2Tag = new Observable("");

    bindings.metaCommentators = new Observable("");
    bindings.metaFightRule = new Observable("");
    bindings.metaNotation = new Observable("");
    bindings.metaSponsor = new Observable("");
    bindings.metaPrizepool = new Observable("");
    bindings.metaTitle = new Observable("");
    bindings.metaUrl = new Observable("");
    bindings.metaPlayersCount = new Observable(0);

    bindings.gameInfoP1Wins = new Computed(() => bindings.gameInfoPlayer1Counter.value, [bindings.gameInfoPlayer1Counter]);
    bindings.gameInfoP2Wins = new Computed(() => bindings.gameInfoPlayer2Counter.value, [bindings.gameInfoPlayer2Counter]);

    bindings.player1FullName = new Computed(() => getFullName(1), [bindings.gameInfoPlayer1Sponsor, bindings.gameInfoPlayer1Name]);
    bindings.player2FullName = new Computed(() => getFullName(2), [bindings.gameInfoPlayer2Name, bindings.gameInfoPlayer2Sponsor]);

    applyBindings();
};

document.addEventListener("DOMContentLoaded", async function (event) {
    try {
        setTimeout(app, 0);
        await start();
    } catch (err) {
        console.error(err);
    }
});
