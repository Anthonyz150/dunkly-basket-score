'use client';
import { useState, useEffect } from 'react';
import { getFromLocal, saveToLocal } from '@/lib/store';

export default function EMarquePage({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<any>(null);
  const [chrono, setChrono] = useState(600); // 10 minutes en secondes
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const matchs = getFromLocal('matchs') || [];
    const found = matchs.find((m: any) => m.id === params.id);
    setMatch(found);
  }, [params.id]);

  // Logique du Chrono
  useEffect(() => {
    let interval: any;
    if (isRunning && chrono > 0) {
      interval = setInterval(() => setChrono(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const modifierScore = (equipe: 'A' | 'B', points: number) => {
    const key = equipe === 'A' ? 'scoreA' : 'scoreB';
    const updatedMatch = { ...match, [key]: Math.max(0, match[key] + points) };
    setMatch(updatedMatch);
    
    // Sauvegarde en temps réel
    const matchs = getFromLocal('matchs') || [];
    const newMatchs = matchs.map((m: any) => m.id === match.id ? updatedMatch : m);
    saveToLocal('matchs', newMatchs);
  };

  if (!match) return <p>Chargement du match...</p>;

  return (
    <main style={eMarqueContainer}>
      {/* HEADER : CHRONO & INFOS */}
      <div style={headerStyle}>
        <div style={teamInfo}>
          <h2>{match.equipeA}</h2>
          <div style={bigScore}>{match.scoreA}</div>
        </div>

        <div style={chronoBox}>
          <div style={{ fontSize: '4rem', fontWeight: '900', color: '#ff4444' }}>{formatTime(chrono)}</div>
          <button onClick={() => setIsRunning(!isRunning)} style={chronoBtn}>
            {isRunning ? 'PAUSE' : 'START'}
          </button>
        </div>

        <div style={teamInfo}>
          <h2>{match.equipeB}</h2>
          <div style={bigScore}>{match.scoreB}</div>
        </div>
      </div>

      {/* PANNEAU DE CONTRÔLE DES POINTS */}
      <div style={controlGrid}>
        <div style={pointColumn}>
          <button onClick={() => modifierScore('A', 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore('A', 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore('A', 3)} style={ptBtn}>+3</button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p>Arbitre : {match.arbitre}</p>
          <p>{match.competition}</p>
        </div>

        <div style={pointColumn}>
          <button onClick={() => modifierScore('B', 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore('B', 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore('B', 3)} style={ptBtn}>+3</button>
        </div>
      </div>
    </main>
  );
}

// STYLES E-MARQUE
const eMarqueContainer = { backgroundColor: '#111', color: 'white', minHeight: '100vh', padding: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#222', padding: '30px', borderRadius: '15px', border: '2px solid #333' };
const bigScore = { fontSize: '6rem', fontWeight: '900', color: '#e65100' };
const chronoBox = { textAlign: 'center' as const, border: '4px solid #444', padding: '20px', borderRadius: '10px' };
const chronoBtn = { background: '#e65100', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const controlGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '50px', marginTop: '40px' };
const pointColumn = { display: 'flex', gap: '10px', justifyContent: 'center' };
const ptBtn = { padding: '20px', fontSize: '1.5rem', borderRadius: '10px', border: '1px solid #e65100', background: 'transparent', color: 'white', cursor: 'pointer', width: '80px' };
const teamInfo = { textAlign: 'center' as const, width: '200px' };