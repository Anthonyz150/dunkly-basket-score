"use client";

interface ScoreCardProps {
    equipeA: string;
    equipeB: string;
    scoreA: number;
    scoreB: number;
    arbitre: string;
  }
  
  export default function ScoreCard({ equipeA, equipeB, scoreA, scoreB, arbitre }: ScoreCardProps) {
    const vainqueur = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Nul';
  
    return (
      <div className="score-card">
        <div className="teams-row">
          <div className={`team ${vainqueur === 'A' ? 'winner' : ''}`}>
            <span className="team-name">{equipeA}</span>
            <span className="score">{scoreA}</span>
          </div>
          <div className="vs">VS</div>
          <div className={`team ${vainqueur === 'B' ? 'winner' : ''}`}>
            <span className="score">{scoreB}</span>
            <span className="team-name">{equipeB}</span>
          </div>
        </div>
        <div className="referee-info">
          🏁 Officiel : <span>{arbitre}</span>
        </div>
      </div>
    );
  }