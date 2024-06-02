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
                    connection.invoke('Update', JSON.stringify(model));
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

const addWinnerTagLeftSide = (pole) => {
    const addition = " [L]";
    const addition2 = " [W]";
    if (bindings[pole].value.includes(addition) || bindings[pole].value.includes(addition2)) {
        bindings[pole].value = bindings[pole].value.replace(addition, "");
        bindings[pole].value = bindings[pole].value.replace(addition2, "");
    }

    bindings[pole].value = bindings[pole].value + addition2;
};

const addLooserTagLeftSide = (pole) => {
    const addition = " [L]";
    const addition2 = " [W]";
    if (bindings[pole].value.includes(addition) || bindings[pole].value.includes(addition2)) {
        bindings[pole].value = bindings[pole].value.replace(addition, "");
        bindings[pole].value = bindings[pole].value.replace(addition2, "");
    }
    bindings[pole].value = bindings[pole].value + addition;
};

const addLooserTagRightSide = (pole) => {
    const addition = "[L] ";
    const addition2 = "[W] ";
    if (bindings[pole].value.includes(addition) || bindings[pole].value.includes(addition2)) {
        bindings[pole].value = bindings[pole].value.replace(addition, "");
        bindings[pole].value = bindings[pole].value.replace(addition2, "");
    }
    bindings[pole].value = addition + bindings[pole].value;
};

const addWinnerTagRightSide = (pole) => {
    const addition = "[L] ";
    const addition2 = "[W] ";
    if (bindings[pole].value.includes(addition) || bindings[pole].value.includes(addition2)) {
        bindings[pole].value = bindings[pole].value.replace(addition, "");
        bindings[pole].value = bindings[pole].value.replace(addition2, "");
    }
    bindings[pole].value = addition2 + bindings[pole].value;
};

const increment = (pole) => {
    var value = bindings[pole].value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[pole].value = value + 1;
    }
}

const decrement = (pole) => {
    var value = bindings[pole].value;

    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[pole].value = value - 1;
    }
}

const zeroing = (pole) => {
    var value = bindings[pole].value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
        bindings[pole].value = 0;
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
    bindings.gameInfoPlayer1Name.value = mainModel.GameInfo.Player1.Name;
    bindings.gameInfoPlayer1Country.value = mainModel.GameInfo.Player1.Country;
    bindings.gameInfoPlayer1Character.value = mainModel.GameInfo.Player1.Character;
    bindings.gameInfoPlayer1Sponsor.value = mainModel.GameInfo.Player1.Sponsor;
    bindings.gameInfoPlayer1Counter.value = mainModel.GameInfo.Player1.Counter;

    bindings.gameInfoPlayer2Name.value = mainModel.GameInfo.Player2.Name;
    bindings.gameInfoPlayer2Country.value = mainModel.GameInfo.Player2.Country;
    bindings.gameInfoPlayer2Character.value = mainModel.GameInfo.Player2.Character;
    bindings.gameInfoPlayer2Sponsor.value = mainModel.GameInfo.Player2.Sponsor;
    bindings.gameInfoPlayer2Counter.value = mainModel.GameInfo.Player2.Counter;

    bindings.metaCommentators.value = mainModel.Meta.Commentators;
    bindings.metaFightRule.value = mainModel.Meta.FightRule;
    bindings.metaNotation.value = mainModel.Meta.Notation;
    bindings.metaSponsor.value = mainModel.Meta.Sponsor;
    bindings.metaPrizepool.value = mainModel.Meta.Prizepool;
    bindings.metaTitle.value = mainModel.Meta.Title;
    bindings.metaUrl.value = mainModel.Meta.Url;
    bindings.metaPlayersCount.value = mainModel.Meta.PlayersCount;
};

const createMainModelFromBindings = (bindings) => {
    const mainModel = new MainModel();

    mainModel.GameInfo.Player1 = new Player();
    mainModel.GameInfo.Player1.Name = bindings.gameInfoPlayer1Name.value;
    mainModel.GameInfo.Player1.Country = bindings.gameInfoPlayer1Country.value;
    mainModel.GameInfo.Player1.Character = bindings.gameInfoPlayer1Character.value;
    mainModel.GameInfo.Player1.Sponsor = bindings.gameInfoPlayer1Sponsor.value;
    mainModel.GameInfo.Player1.Counter = bindings.gameInfoPlayer1Counter.value;

    mainModel.GameInfo.Player2 = new Player();
    mainModel.GameInfo.Player2.Name = bindings.gameInfoPlayer2Name.value;
    mainModel.GameInfo.Player2.Country = bindings.gameInfoPlayer2Country.value;
    mainModel.GameInfo.Player2.Character = bindings.gameInfoPlayer2Character.value;
    mainModel.GameInfo.Player2.Sponsor = bindings.gameInfoPlayer2Sponsor.value;
    mainModel.GameInfo.Player2.Counter = bindings.gameInfoPlayer2Counter.value;

    mainModel.Meta.Commentators = bindings.metaCommentators.value;
    mainModel.Meta.FightRule = bindings.metaFightRule.value;
    mainModel.Meta.Notation = bindings.metaNotation.value;
    mainModel.Meta.Sponsor = bindings.metaSponsor.value;
    mainModel.Meta.Prizepool = bindings.metaPrizepool.value;
    mainModel.Meta.Title = bindings.metaTitle.value;
    mainModel.Meta.Url = bindings.metaUrl.value;
    mainModel.Meta.PlayersCount = bindings.metaPlayersCount.value;

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

connection.on("Update", function (content) {
    const model = JSON.parse(content);
    console.log(model);
    window.isSignalrUpdate = true;
    updateModel(model);
    window.isSignalrUpdate = false;
});

connection.on("GetOnStartup", function (content) {
    const model = JSON.parse(content);
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

    bindings.gameInfoPlayer2Name = new Observable("");
    bindings.gameInfoPlayer2Country = new Observable("ru");
    bindings.gameInfoPlayer2Character = new Observable("");
    bindings.gameInfoPlayer2Sponsor = new Observable("");
    bindings.gameInfoPlayer2Counter = new Observable(0);

    bindings.metaCommentators = new Observable("");
    bindings.metaFightRule = new Observable("");
    bindings.metaNotation = new Observable("");
    bindings.metaSponsor = new Observable("");
    bindings.metaPrizepool = new Observable("");
    bindings.metaTitle = new Observable("");
    bindings.metaUrl = new Observable("");
    bindings.metaPlayersCount = new Observable(0);

    // ������� computed �������� ��� �����, ������� ������� �� ������ �����
    bindings.gameInfoP1Wins = new Computed(() => bindings.gameInfoPlayer1Counter.value, [bindings.gameInfoPlayer1Counter]);
    bindings.gameInfoP2Wins = new Computed(() => bindings.gameInfoPlayer2Counter.value, [bindings.gameInfoPlayer2Counter]);

    bindings.player1FullName = new Computed(() => getFullName(1), [bindings.gameInfoPlayer1Sponsor, bindings.gameInfoPlayer1Name]);
    bindings.player2FullName = new Computed(() => getFullName(2), [bindings.gameInfoPlayer2Name, bindings.gameInfoPlayer2Sponsor]);

    // ��������� binding � ��������� �� ��������
    applyBindings();
};

document.addEventListener("DOMContentLoaded", async function (event) {
    try {
        setTimeout(app, 0);
        await start();
        await connection.invoke("GetOnStartup", null);
    } catch (err) {
        console.error(err);
    }
});
