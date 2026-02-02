"use client";

import { useState, useEffect, use, useRef } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EMarquePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const router = useRouter();

  const [match, setMatch] = useState<any>(null);
  const [chrono, setChrono] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [quartTemps, setQuartTemps] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextPeriod, setNextPeriod] = useState<number | null>(null);

  // ÉTATS POUR LES TEMPS MORTS
  const [tmA, setTmA] = useState(0);
  const [tmB, setTmB] = useState(0);

  // REFS POUR LE CHRONO ET L'AJUSTEMENT MANUEL
  const adjustTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const data = getFromLocal("matchs");
    const matchs = Array.isArray(data) ? data : [];
    const found = matchs.find((m: any) => m.id === matchId) || null;
    
    if (found) {
      setMatch(found);
      if (found.config?.tempsInitial) setChrono(found.config.tempsInitial);
    }
  }, [matchId]);

  useEffect(() => {
    if (!isRunning || chrono <= 0) {
      if (chrono === 0) setIsRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setChrono(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // --- LOGIQUE AJUSTEMENT MANUEL (PRESS & HOLD) ---
  const ajusterTemps = (delta: number) => {
    setChrono((prev) => {
      const nouveau = prev + delta;
      return nouveau < 0 ? 0 : nouveau;
    });
  };

  const startAdjusting = (delta: number) => {
    ajusterTemps(delta); // Premier saut immédiat
    adjustTimerRef.current = setInterval(() => {
      ajusterTemps(delta);
    }, 150); // Répétition rapide
  };

  const stopAdjusting = () => {
    if (adjustTimerRef.current) {
      clearInterval(adjustTimerRef.current);
      adjustTimerRef.current = null;
    }
  };

  // --- LOGIQUE TEMPS MORT ---
  const utiliserTM = (equipe: "A" | "B") => {
    const max = match?.config?.maxTempsMorts || 2;
    if (equipe === "A" && tmA < max) {
      setTmA(prev => prev + 1);
      setIsRunning(false); 
    } else if (equipe === "B" && tmB < max) {
      setTmB(prev => prev + 1);
      setIsRunning(false);
    }
  };

  const renderPastillesTM = (pris: number) => {
    const max = match?.config?.maxTempsMorts || 2;
    return (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} style={{
            width: '14px', height: '14px', borderRadius: '50%',
            backgroundColor: i < pris ? '#ef4444' : '#e2e8f0',
            border: '2px solid #cbd5e1'
          }} />
        ))}
      </div>
    );
  };

  const modifierScore = (equipe: "A" | "B", points: number) => {
    if (!match) return;
    const key = equipe === "A" ? "scoreA" : "scoreB";
    const updatedMatch = { ...match, [key]: Math.max(0, match[key] + points) };
    setMatch(updatedMatch);
    const data = getFromLocal("matchs");
    const matchs = Array.isArray(data) ? data : [];
    saveToLocal("matchs", matchs.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m));
  };

  if (!match) return <div style={{ padding: '20px', fontWeight: 'bold' }}>Chargement...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {showConfirmModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Passer à la période {nextPeriod} ?</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button onClick={() => { setQuartTemps(nextPeriod!); setChrono(match.config?.tempsInitial || 600); setShowConfirmModal(false); }} style={confirmBtn}>Confirmer</button>
              <button onClick={() => setShowConfirmModal(false)} style={cancelBtn}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontWeight: '900', fontSize: '1.8rem', margin: 0 }}>TABLE DE MARQUE</h1>
          <p style={{ color: '#F97316', fontWeight: 'bold' }}>{match.clubA} vs {match.clubB}</p>
        </div>
        <Link href="/matchs/a-venir" style={quitBtn}>✕ QUITTER</Link>
      </div>

      <div style={mainCard}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: '900', fontSize: '1.4rem' }}>PÉRIODE {quartTemps}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {/* ÉQUIPE A */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeA}</h2>
            <div style={scoreValueStyle}>{match.scoreA}</div>
            {renderPastillesTM(tmA)}
            <button onClick={() => utiliserTM("A")} disabled={tmA >= (match.config?.maxTempsMorts || 2)} style={tmBtnStyle(tmA >= (match.config?.maxTempsMorts || 2))}>
              TEMPS MORT
            </button>
          </div>

          {/* CHRONO CENTRAL */}
          <div style={{ flex: 1.5, textAlign: 'center' }}>
            {/* RÉGLAGE MANUEL -5s */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <button 
                onMouseDown={() => startAdjusting(-5)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}
                onTouchStart={(e) => { e.preventDefault(); startAdjusting(-5); }} onTouchEnd={stopAdjusting}
                style={adjustBtn}
              > -5s </button>

              <div style={{ fontSize: '7.5rem', fontWeight: '900', fontFamily: 'monospace', color: '#ef4444', minWidth: '350px' }}>
                {formatTime(chrono)}
              </div>

              <button 
                onMouseDown={() => startAdjusting(5)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}
                onTouchStart={(e) => { e.preventDefault(); startAdjusting(5); }} onTouchEnd={stopAdjusting}
                style={adjustBtn}
              > +5s </button>
            </div>

            <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>
              {isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}
            </button>
          </div>

          {/* ÉQUIPE B */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeB}</h2>
            <div style={scoreValueStyle}>{match.scoreB}</div>
            {renderPastillesTM(tmB)}
            <button onClick={() => utiliserTM("B")} disabled={tmB >= (match.config?.maxTempsMorts || 2)} style={tmBtnStyle(tmB >= (match.config?.maxTempsMorts || 2))}>
              TEMPS MORT
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '25px' }}>
        <div style={scoreBtnGroup}>
          <button onClick={() => modifierScore("A", 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore("A", 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore("A", 3)} style={ptBtn}>+3</button>
        </div>
        <div style={scoreBtnGroup}>
          <button onClick={() => modifierScore("B", 1)} style={ptBtn}>+1</button>
          <button onClick={() => modifierScore("B", 2)} style={ptBtn}>+2</button>
          <button onClick={() => modifierScore("B", 3)} style={ptBtn}>+3</button>
        </div>
      </div>
    </div>
  );
}

// STYLES AVEC "AS CONST" POUR TYPESCRIPT
const mainCard = { backgroundColor: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0' } as const;
const equipeNameStyle = { fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '5px' } as const;
const scoreValueStyle = { fontSize: '8rem', fontWeight: '900', lineHeight: 1 } as const;
const scoreBtnGroup = { backgroundColor: '#fff', borderRadius: '20px', padding: '15px', display: 'flex', gap: '10px', border: '1px solid #e2e8f0' } as const;
const ptBtn = { flex: 1, padding: '20px', fontSize: '1.8rem', fontWeight: '900', borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer' } as const;
const adjustBtn = { padding: '10px 15px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', userSelect: 'none' } as const;
const quitBtn = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 'bold' } as const;
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 } as const;
const modalContent = { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' } as const;
const confirmBtn = { padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } as const;
const cancelBtn = { padding: '10px 20px', background: '#f1f5f9', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer' } as const;

const tmBtnStyle = (disabled: boolean) => ({
  marginTop: '15px',
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: disabled ? '#f1f5f9' : '#F97316',
  color: disabled ? '#94a3b8' : 'white',
  fontWeight: '900',
  fontSize: '0.75rem',
  cursor: disabled ? 'not-allowed' : 'pointer'
} as const);

const startBtn = (isRunning: boolean) => ({
  backgroundColor: isRunning ? '#ef4444' : '#22c55e',
  color: '#fff',
  border: 'none',
  padding: '15px 50px',
  borderRadius: '12px',
  fontWeight: '900',
  cursor: 'pointer',
  fontSize: '1.2rem',
  marginTop: '20px'
} as const);