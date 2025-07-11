// Компонент создан на основе Scoreboard.cshtml из Tabloid
import React, { useEffect, useState } from "react";
import { SignalRContext } from "../SignalRProvider";
import "../scoreboard.scss";

type Player = {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  final: string; // "winner", "loser", "none"
};

type MetaInfo = {
  title: string;
  fightRule: string;
};

type ScoreboardState = {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
};

const Scoreboard: React.FC = () => {
  const [player1, setPlayer1] = useState<Player>({
    name: "Player 1",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [player2, setPlayer2] = useState<Player>({
    name: "Player 2",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [meta, setMeta] = useState<MetaInfo>({
    title: "",
    fightRule: "",
  });

  // Подписка на SignalR события
  useEffect(() => {
    const handleReceiveState = (state: ScoreboardState) => {
      setPlayer1(state.player1);
      setPlayer2(state.player2);
      setMeta(state.meta);
    };

    SignalRContext.connection?.on("ReceiveState", handleReceiveState);

    return () => {
      SignalRContext.connection?.off("ReceiveState", handleReceiveState);
    };
  }, []);

  return (
    <div className="scoreboard-bg">
      <div id="banner">
        <div className="left-skew" id="left">
          <div className="score">
            <h2 data-side="left">{player1.score}</h2>
          </div>
          <div className="score-bar">
            <h4 className="playerName">
              <span data-side="left">
                {player1.final === "winner"
                  ? "[W] "
                  : player1.final === "loser"
                  ? "[L] "
                  : ""}
                {player1.name}
              </span>{" "}
              <span className="side" data-side="left"></span>
            </h4>
          </div>
        </div>
        <div className="double-skew" id="middle">
          <h5 id="metaTitle">{meta.title}</h5>
          <h5 id="round">{meta.fightRule}</h5>
        </div>
        <div id="right">
          <div className="score">
            <h2 data-side="right">{player2.score}</h2>
          </div>
          <div className="score-bar">
            <h4 className="playerName">
              <span data-side="right">
                {player2.final === "winner"
                  ? "[W] "
                  : player2.final === "loser"
                  ? "[L] "
                  : ""}
                {player2.name}
              </span>{" "}
              <span className="side" data-side="right"></span>
            </h4>
          </div>
        </div>
      </div>
      <div id="downBar">
        <div className="double-skew hidden" id="subBar1" style={{ opacity: 1 }}>
          <h6 className="text-center justify-content-center">
            {player1.tag}
          </h6>
        </div>
        <div className="double-skew hidden" id="subBar2" style={{ opacity: 1 }}>
          <h6 className="text-center justify-content-center">
            {player2.tag}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
