// Компонент создан на основе Scoreboard.cshtml из Tabloid
import React from 'react';
import '../scoreboard.scss';
import { useScoreboardStore } from '../store';

const Scoreboard: React.FC = () => {
  const player1 = useScoreboardStore(s => s.player1);
  const player2 = useScoreboardStore(s => s.player2);
  const meta = useScoreboardStore(s => s.meta);
  return (
    <div className="scoreboard-bg">
      <div id="banner">
        <div className="left-skew" id="left">
          <div className="score">
            <h2 data-side="left">{player1.score}</h2>
          </div>
          <div className="score-bar">
            <h4 className="playerName">
              <span data-side="left">{player1.final === 'winner' ? '[W] ' : player1.final === 'loser' ? '[L] ' : ''}{player1.name}</span> <span className="side" data-side="left"></span>
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
              <span data-side="right">{player2.final === 'winner' ? '[W] ' : player2.final === 'loser' ? '[L] ' : ''}{player2.name}</span> <span className="side" data-side="right"></span>
            </h4>
          </div>
        </div>
      </div>
      <div id="downBar">
        <div className="double-skew hidden" id="subBar1" style={{ opacity: 1 }}>
          <h6 className="text-center justify-content-center">{player1.sponsor}</h6>
        </div>
        <div className="double-skew hidden" id="subBar2" style={{ opacity: 1 }}>
          <h6 className="text-center justify-content-center">{player2.sponsor}</h6>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard; 