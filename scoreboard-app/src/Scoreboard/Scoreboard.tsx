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

type ColorPreset = {
  textColor?: string;
  scoreColor?: string;
  titleColor?: string;
  backgroundColor?: string;
  scoreBackgroundColor?: string;
};

type ScoreboardState = {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
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
  const [colors, setColors] = useState<ColorPreset>({
    textColor: "#ffffff",
    scoreColor: "#0dcaf0",
    scoreBackgroundColor: "#23272f",
    titleColor: "#ffc107",
    backgroundColor: "#23272f",
  });

  // Подписка на SignalR события
  useEffect(() => {
    const handleReceiveState = (state: ScoreboardState) => {
      setPlayer1(state.player1);
      setPlayer2(state.player2);
      setMeta(state.meta);

      // Обновляем цвета с сервера
      if (state.colors) {
        setColors(state.colors);
      }
    };

    SignalRContext.connection?.on("ReceiveState", handleReceiveState);

    return () => {
      SignalRContext.connection?.off("ReceiveState", handleReceiveState);
    };
  }, []);

  return (
    <div className="scoreboard-bg">
      <div id="banner" style={{ backgroundColor: colors.backgroundColor }}>
        <div
          className="left-skew"
          id="left"
          style={{ backgroundColor: colors.backgroundColor }}
        >
          <div
            className="score"
            style={{ backgroundColor: colors.scoreBackgroundColor }}
          >
            <h2 data-side="left" style={{ color: colors.scoreColor }}>
              {player1.score}
            </h2>
          </div>
          <div className="score-bar">
            <h4 className="playerName" style={{ color: colors.textColor }}>
              <span data-side="left" style={{ color: colors.textColor }}>
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
        <div
          className="double-skew"
          id="middle"
          style={{ backgroundColor: colors.backgroundColor }}
        >
          <h5 id="metaTitle" style={{ color: colors.titleColor }}>
            {meta.title}
          </h5>
          <h5 id="round" style={{ color: colors.titleColor }}>
            {meta.fightRule}
          </h5>
        </div>
        <div id="right" style={{ backgroundColor: colors.backgroundColor }}>
          <div
            className="score"
            style={{ backgroundColor: colors.scoreBackgroundColor }}
          >
            <h2 data-side="right" style={{ color: colors.scoreColor }}>
              {player2.score}
            </h2>
          </div>
          <div className="score-bar">
            <h4 className="playerName" style={{ color: colors.textColor }}>
              <span data-side="right" style={{ color: colors.textColor }}>
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
        <div
          className="double-skew hidden"
          id="subBar1"
          style={{ opacity: 1, backgroundColor: colors.backgroundColor }}
        >
          <h6
            className="text-center justify-content-center"
            style={{ color: colors.textColor }}
          >
            {player1.tag}
          </h6>
        </div>
        <div
          className="double-skew hidden"
          id="subBar2"
          style={{ opacity: 1, backgroundColor: colors.backgroundColor }}
        >
          <h6
            className="text-center justify-content-center"
            style={{ color: colors.textColor }}
          >
            {player2.tag}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
