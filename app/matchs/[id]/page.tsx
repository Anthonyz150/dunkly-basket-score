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
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // ÉTATS TEMPS MORTS
  const [tmA, setTmA] = useState<boolean[]>([false, false]);
  const [tmB, setTmB] = useState<boolean[]>([false, false]);

  // ÉTATS FAUTES, DRAPEAUX ET POSSESSION
  const [fautesA, setFautesA] = useState(0);
  const [fautesB, setFautesB] = useState(0);
  const [possession, setPossession] = useState<"A" | "B">("A");

  // ÉTAT CHRONO TEMPS MORT
  const [tmChrono, setTmChrono] = useState<number | null>(null);
  const [isTmActive, setIsTmActive] = useState(false);

  const adjustTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressDelayRef = useRef<NodeJS.Timeout | null>(null);

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
    const interval = setInterval(() => setChrono(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  useEffect(() => {
    if (!isTmActive || tmChrono === null || tmChrono <= 0) {
      if (tmChrono === 0) setIsTmActive(false);
      return;
    }
    const interval = setInterval(() => setTmChrono(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(interval);
  }, [isTmActive, tmChrono]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const toggleTM = (equipe: "A" | "B", index: number) => {
    setIsRunning(false); 
    if (equipe === "A") {
      const newTm = [...tmA];
      newTm[index] = !newTm[index];
      setTmA(newTm);
      if (newTm[index]) { setTmChrono(60); setIsTmActive(true); }
    } else {
      const newTm = [...tmB];
      newTm[index] = !newTm[index];
      setTmB(newTm);
      if (newTm[index]) { setTmChrono(60); setIsTmActive(true); }
    }
  };

  const appliquerAjustement = (valeur: number) => {
    const tempsMax = match?.config?.tempsInitial || 600;
    setChrono(prev => {
      const n = prev + valeur;
      return n < 0 ? 0 : n > tempsMax ? tempsMax : n;
    });
  };

  const startAdjusting = (dir: "UP" | "DOWN") => {
    appliquerAjustement(dir === "UP" ? 1 : -1);
    longPressDelayRef.current = setTimeout(() => {
      adjustTimerRef.current = setInterval(() => appliquerAjustement(dir === "UP" ? 5 : -5), 200);
    }, 400);
  };

  const stopAdjusting = () => {
    if (adjustTimerRef.current) clearInterval(adjustTimerRef.current);
    if (longPressDelayRef.current) clearTimeout(longPressDelayRef.current);
  };

  // --- LOGIQUE REDIRECTION CORRIGÉE ---
  const finaliserLeMatch = () => {
    if (!match) return;
    
    if (confirm("Clôturer le match et enregistrer le résultat ?")) {
      const data = getFromLocal("matchs") || [];
      const updatedMatchs = data.map((m: any) => 
        m.id === matchId ? { 
          ...m, 
          scoreA: match.scoreA, 
          scoreB: match.scoreB, 
          status: 'termine', 
          dateFin: new Date().toISOString() 
        } : m
      );

      saveToLocal("matchs", updatedMatchs);

      // REDIRECTION VERS LE BON CHEMIN (vu dans ton dossier)
      router.push("/matchs/resultats");
      
      // Sécurité ultime
      setTimeout(() => {
        if (window.location.pathname !== "/matchs/resultats") {
          window.location.href = "/matchs/resultats";
        }
      }, 300);
    }
  };

  const passerPeriodeSuivante = () => {
    if (quartTemps < 4) {
      setQuartTemps(prev => prev + 1);
      setChrono(match?.config?.tempsInitial || 600);
      setFautesA(0);
      setFautesB(0);
      setIsRunning(false);
      setShowPeriodModal(false);
    }
  };

  const modifierScore = (equipe: "A" | "B", pts: number) => {
    if (!match) return;
    const key = equipe === "A" ? "scoreA" : "scoreB";
    setMatch({ ...match, [key]: Math.max(0, match[key] + pts) });
  };

  if (!match) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* OVERLAY TEMPS MORT */}
      {isTmActive && tmChrono !== null && (
        <div style={tmOverlayStyle}>
          <div style={tmModalContent}>
            <h2 style={{ fontSize: '2rem', color: '#1e293b' }}>TEMPS MORT</h2>
            <div style={{ fontSize: '10rem', fontWeight: '900', color: tmChrono <= 5 ? '#ef4444' : '#F97316', fontFamily: 'monospace' }}>
              {tmChrono}s
            </div>
            <button onClick={() => setIsTmActive(false)} style={closeTmBtn}>RETOUR AU MATCH</button>
          </div>
        </div>
      )}

      {/* MODALE PÉRIODE */}
      {showPeriodModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#1e293b' }}>Passer à la Période {quartTemps + 1} ?</h2>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '20px 0' }}>⚠️ Action irréversible. Les fautes d'équipe seront remises à zéro.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={passerPeriodeSuivante} style={confirmBtn}>VALIDER</button>
              <button onClick={() => setShowPeriodModal(false)} style={cancelBtn}>ANNULER</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ fontWeight: '900', fontSize: '1.8rem', margin: 0 }}>E-MARQUE</h1>
          <p style={{ color: '#F97316', fontWeight: 'bold' }}>{match.clubA} vs {match.clubB}</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>POSSESSION</p>
          <button onClick={() => setPossession(prev => prev === "A" ? "B" : "A")} style={possessionBtn}>
            {possession === "A" ? "◀" : "▶"}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            {!isRunning && (
                quartTemps < 4 ? <button onClick={() => setShowPeriodModal(true)} style={nextPeriodBtn}>PÉRIODE SUIVANTE ➔</button> 
                : <button onClick={finaliserLeMatch} style={finishMatchBtn}>TERMINER LE MATCH 🏁</button>
            )}
            <Link href="/matchs/a-venir" style={quitBtn}>✕ QUITTER</Link>
        </div>
      </div>

      <div style={mainCard}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: '900', fontSize: '1.6rem', color: '#1e293b' }}>PÉRIODE {quartTemps}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeA}</h2>
            <div style={scoreValueStyle}>{match.scoreA}</div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b' }}>FAUTES D'ÉQUIPE</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setFautesA(prev => Math.max(0, prev - 1))} style={fautesSmallBtn}>-</button>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={fautesDisplay(fautesA)}>{fautesA}</span>
                  {fautesA >= 4 && <span style={flagStyleA}>🚩</span>}
                </div>
                <button onClick={() => setFautesA(prev => Math.min(5, prev + 1))} style={fautesSmallBtn}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {tmA.map((pris, i) => <button key={i} onClick={() => toggleTM("A", i)} style={tmSquareStyle(pris)}>TM {i+1}</button>)}
            </div>
          </div>

          <div style={{ flex: 1.5, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <button onMouseDown={() => startAdjusting("DOWN")} onMouseUp={stopAdjusting} style={arrowBtn}>▼</button>
              <div style={{ fontSize: '7rem', fontWeight: '900', fontFamily: 'monospace', color: '#ef4444', minWidth: '320px' }}>
                {formatTime(chrono)}
              </div>
              <button onMouseDown={() => startAdjusting("UP")} onMouseUp={stopAdjusting} style={arrowBtn}>▲</button>
            </div>
            <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>
              {isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}
            </button>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeB}</h2>
            <div style={scoreValueStyle}>{match.scoreB}</div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b' }}>FAUTES D'ÉQUIPE</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setFautesB(prev => Math.max(0, prev - 1))} style={fautesSmallBtn}>-</button>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {fautesB >= 4 && <span style={flagStyleB}>🚩</span>}
                  <span style={fautesDisplay(fautesB)}>{fautesB}</span>
                </div>
                <button onClick={() => setFautesB(prev => Math.min(5, prev + 1))} style={fautesSmallBtn}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {tmB.map((pris, i) => <button key={i} onClick={() => toggleTM("B", i)} style={tmSquareStyle(pris)}>TM {i+1}</button>)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={scoreBtnGroup}><button onClick={() => modifierScore("A", 1)} style={ptBtn}>+1</button><button onClick={() => modifierScore("A", 2)} style={ptBtn}>+2</button><button onClick={() => modifierScore("A", 3)} style={ptBtn}>+3</button></div>
        <div style={scoreBtnGroup}><button onClick={() => modifierScore("B", 1)} style={ptBtn}>+1</button><button onClick={() => modifierScore("B", 2)} style={ptBtn}>+2</button><button onClick={() => modifierScore("B", 3)} style={ptBtn}>+3</button></div>
      </div>
    </div>
  );
}

// STYLES
const flagStyleA = { position: 'absolute' as const, right: '-30px', fontSize: '1.5rem' };
const flagStyleB = { position: 'absolute' as const, left: '-30px', fontSize: '1.5rem' };
const mainCard = { backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0' } as const;
const scoreValueStyle = { fontSize: '7.5rem', fontWeight: '900', lineHeight: 1, margin: '5px 0' } as const;
const equipeNameStyle = { fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' } as const;
const ptBtn = { flex: 1, padding: '15px', fontSize: '1.5rem', fontWeight: '900', borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer' } as const;
const scoreBtnGroup = { backgroundColor: '#fff', borderRadius: '20px', padding: '10px', display: 'flex', gap: '10px', border: '1px solid #e2e8f0' } as const;
const arrowBtn = { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' } as const;
const possessionBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', fontSize: '1.5rem', cursor: 'pointer' } as const;
const fautesDisplay = (count: number) => ({ fontSize: '2.5rem', fontWeight: '900', color: count >= 4 ? '#ef4444' : '#1e293b', minWidth: '40px', display: 'inline-block' } as const);
const fautesSmallBtn = { width: '35px', height: '35px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' } as const;
const tmSquareStyle = (pris: boolean) => ({ width: '55px', height: '40px', borderRadius: '8px', border: 'none', backgroundColor: pris ? '#ef4444' : '#e2e8f0', color: pris ? 'white' : '#64748b', fontWeight: '900', cursor: 'pointer' } as const);
const startBtn = (isRunning: boolean) => ({ backgroundColor: isRunning ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '12px 50px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '1.2rem', marginTop: '20px' } as const);
const quitBtn = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 'bold' } as const;
const nextPeriodBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' } as const;
const finishMatchBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' } as const;
const tmOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const tmModalContent = { textAlign: 'center' as const, padding: '50px' };
const closeTmBtn = { marginTop: '30px', padding: '15px 30px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' } as const;
const overlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modalStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center' as const, maxWidth: '500px' };
const confirmBtn = { backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' } as const;
const cancelBtn = { backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' } as const;