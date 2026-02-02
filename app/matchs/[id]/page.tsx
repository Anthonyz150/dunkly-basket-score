"use client";

import { useState, useEffect, use } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";

type Match = {
  id: string;
  equipeA: string;
  equipeB: string;
  scoreA: number;
  scoreB: number;
  arbitre: string;
  competition: string;
};

export default function EMarquePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;

  const [match, setMatch] = useState<Match | null>(null);
  const [chrono, setChrono] = useState(600);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const matchs: Match[] = getFromLocal("matchs") ?? [];
    const found = matchs.find(m => m.id === matchId) || null;
    setMatch(found);
  }, [matchId]);

  useEffect(() => {
    if (!isRunning || chrono <= 0) return;
    const interval = setInterval(() => {
      setChrono(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const modifierScore = (equipe: "A" | "B", points: number) => {
    if (!match) return;
    const key = equipe === "A" ? "scoreA" : "scoreB";
    const updatedMatch: Match = {
      ...match,
      [key]: Math.max(0, match[key] + points),
    };
    setMatch(updatedMatch);
    const matchs: Match[] = getFromLocal("matchs") ?? [];
    const updatedMatchs = matchs.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    saveToLocal("matchs", updatedMatchs);
  };

  if (!match) return <main style={eMarqueContainer}><p>Chargement...</p></main>;

  return (
    <main style={eMarqueContainer}>
      <div style={headerStyle}>
        <div style={teamInfo}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{match.equipeA}</h2>
          <div style={bigScore}>{match.scoreA}</div>
        </div>

        <div style={chronoBox}>
          <div style={chronoText}>{formatTime(chrono)}</div>
          <button onClick={() => setIsRunning(prev => !prev)} style={chronoBtn}>
            {isRunning ? "PAUSE" : "START"}
          </button>
        </div>

        <div style={teamInfo}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{match.equipeB}</h2>
          <div style={bigScore}>{match.scoreB}</div>
        </div>
      </div>

      <div style={controlGrid}>
        <div style={pointColumn}>
          <button onClick={() => modifierScore("A", 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore("A", 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore("A", 3)} style={ptBtn}>+3</button>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: '#555', margin: 0 }}>🏁 {match.arbitre}</p>
          <p style={{ color: '#F97316', fontWeight: 'bold' }}>{match.competition}</p>
        </div>

        <div style={pointColumn}>
          <button onClick={() => modifierScore("B", 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore("B", 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore("B", 3)} style={ptBtn}>+3</button>
        </div>
      </div>
    </main>
  );
}

/* ---------- STYLE UNIQUE (SANS DOUBLONS) ---------- */

const eMarqueContainer: React.CSSProperties = {
  backgroundColor: "#000",
  color: "white",
  minHeight: "100vh",
  padding: "40px 20px",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: "#0a0a0a",
  padding: "40px",
  borderRadius: "20px",
  border: "2px solid #1a1a1a",
};

const bigScore: React.CSSProperties = {
  fontSize: "8rem",
  fontWeight: "900",
  color: "#F97316",
  textShadow: "0 0 20px rgba(249, 115, 22, 0.4)",
  lineHeight: 1,
};

const chronoBox: React.CSSProperties = {
  textAlign: "center",
  border: "4px solid #1a1a1a",
  padding: "30px",
  borderRadius: "15px",
  backgroundColor: "#050505",
};

const chronoText: React.CSSProperties = {
  fontSize: "5rem",
  fontWeight: "900",
  color: "#ff3131",
  fontFamily: "monospace",
  textShadow: "0 0 15px rgba(255, 49, 49, 0.5)",
  marginBottom: "10px",
};

const chronoBtn: React.CSSProperties = {
  background: "#F97316",
  color: "white",
  border: "none",
  padding: "12px 25px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const controlGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "20px",
  marginTop: "50px",
};

const pointColumn: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
};

const ptBtn: React.CSSProperties = {
  padding: "20px 0",
  fontSize: "1.8rem",
  fontWeight: "900",
  borderRadius: "12px",
  border: "2px solid #333",
  background: "#111",
  color: "white",
  cursor: "pointer",
  width: "90px",
};

const teamInfo: React.CSSProperties = {
  textAlign: "center",
  width: "250px",
};