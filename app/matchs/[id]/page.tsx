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

  // ÉTATS TEMPS MORTS (2 boutons par équipe)
  const [tmA, setTmA] = useState<boolean[]>([false, false]);
  const [tmB, setTmB] = useState<boolean[]>([false, false]);

  // ÉTAT CHRONO TEMPS MORT (1 minute)
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

  // Chrono principal du match
  useEffect(() => {
    if (!isRunning || chrono <= 0) {
      if (chrono === 0) setIsRunning(false);
      return;
    }
    const interval = setInterval(() => setChrono(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  // Chrono spécifique du Temps Mort (60s)
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

  // --- LOGIQUE TEMPS MORT ---
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

  // --- LOGIQUE AJUSTEMENT MANUEL ---
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

  // --- LOGIQUE PÉRIODE ET FIN ---
  const passerPeriodeSuivante = () => {
    if (quartTemps < 4) {
      setQuartTemps(prev => prev + 1);
      setChrono(match?.config?.tempsInitial || 600);
      setIsRunning(false);
      setShowPeriodModal(false);
    }
  };

  const finaliserLeMatch = () => {
    if (!match) return;
    if (confirm("Clôturer le match et enregistrer le résultat ?")) {
      const data = getFromLocal("matchs");
      const matchsExistants = Array.isArray(data) ? data : [];
      
      const updatedMatchs = matchsExistants.map((m: any) => 
        m.id === matchId ? { ...m, scoreA: match.scoreA, scoreB: match.scoreB, status: 'termine', dateFin: new Date().toISOString() } : m
      );

      saveToLocal("matchs", updatedMatchs);
      router.push("/resultats"); // Assure-toi que le dossier est 'resultats' sans accent
    }
  };

  const modifierScore = (equipe: "A" | "B", pts: number) => {
    if (!match) return;
    const key = equipe === "A" ? "scoreA" : "scoreB";
    const updatedMatch = { ...match, [key]: Math.max(0, match[key] + pts) };
    setMatch(updatedMatch);
    
    // Sauvegarde immédiate du score en local pour éviter les pertes si on rafraîchit
    const data = getFromLocal("matchs");
    const matchs = Array.isArray(data) ? data : [];
    saveToLocal("matchs", matchs.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m));
  };

  if (!match) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* OVERLAY TEMPS MORT (60s) */}
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

      {/* MODALE CHANGEMENT PÉRIODE */}
      {showPeriodModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#1e293b' }}>Passer à la Période {quartTemps + 1} ?</h2>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '20px 0' }}>⚠️ Action irréversible. Impossible de revenir en arrière.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={passerPeriodeSuivante} style={confirmBtn}>VALIDER</button>
              <button onClick={() => setShowPeriodModal(false)} style={cancelBtn}>ANNULER</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontWeight: '900', fontSize: '1.8rem', margin: 0 }}>E-MARQUE</h1>
          <p style={{ color: '#F97316', fontWeight: 'bold' }}>{match.clubA} vs {match.clubB}</p>
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
          <span style={{ fontWeight: '900', fontSize: '2rem', color: '#1e293b' }}>
            {quartTemps === 4 && chrono === 0 ? "MATCH TERMINÉ" : `PÉRIODE ${quartTemps}`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeA}</h2>
            <div style={scoreValueStyle}>{match.scoreA}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {tmA.map((pris, i) => <button key={i} onClick={() => toggleTM("A", i)} style={tmSquareStyle(pris)}>TM {i+1}</button>)}
            </div>
          </div>

          <div style={{ flex: 2, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' }}>
              <button onMouseDown={() => startAdjusting("DOWN")} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={(e) => { e.preventDefault(); startAdjusting("DOWN"); }} onTouchEnd={stopAdjusting} style={arrowBtn}>▼</button>
              <div style={{ fontSize: '8rem', fontWeight: '900', fontFamily: 'monospace', color: '#ef4444', minWidth: '380px' }}>
                {formatTime(chrono)}
              </div>
              <button onMouseDown={() => startAdjusting("UP")} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={(e) => { e.preventDefault(); startAdjusting("UP"); }} onTouchEnd={stopAdjusting} style={arrowBtn}>▲</button>
            </div>
            <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>
              {isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}
            </button>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 style={equipeNameStyle}>{match.equipeB}</h2>
            <div style={scoreValueStyle}>{match.scoreB}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {tmB.map((pris, i) => <button key={i} onClick={() => toggleTM("B", i)} style={tmSquareStyle(pris)}>TM {i+1}</button>)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '25px' }}>
        <div style={scoreBtnGroup}><button onClick={() => modifierScore("A", 1)} style={ptBtn}>+1</button><button onClick={() => modifierScore("A", 2)} style={ptBtn}>+2</button><button onClick={() => modifierScore("A", 3)} style={ptBtn}>+3</button></div>
        <div style={scoreBtnGroup}><button onClick={() => modifierScore("B", 1)} style={ptBtn}>+1</button><button onClick={() => modifierScore("B", 2)} style={ptBtn}>+2</button><button onClick={() => modifierScore("B", 3)} style={ptBtn}>+3</button></div>
      </div>
    </div>
  );
}

// STYLES AVEC AS CONST POUR TYPESCRIPT
const mainCard = { backgroundColor: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0' } as const;
const equipeNameStyle = { fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' } as const;
const scoreValueStyle = { fontSize: '9rem', fontWeight: '900', lineHeight: 1 } as const;
const scoreBtnGroup = { backgroundColor: '#fff', borderRadius: '20px', padding: '15px', display: 'flex', gap: '10px', border: '1px solid #e2e8f0' } as const;
const ptBtn = { flex: 1, padding: '20px', fontSize: '1.8rem', fontWeight: '900', borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer' } as const;
const arrowBtn = { width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' } as const;
const quitBtn = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 'bold' } as const;
const nextPeriodBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' } as const;
const finishMatchBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' } as const;
const tmSquareStyle = (pris: boolean) => ({ width: '60px', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: pris ? '#ef4444' : '#e2e8f0', color: pris ? 'white' : '#64748b', fontWeight: '900', cursor: 'pointer' } as const);
const startBtn = (isRunning: boolean) => ({ backgroundColor: isRunning ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '15px 60px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '1.3rem', marginTop: '30px' } as const);

// STYLES MODALES ET OVERLAYS
const tmOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const tmModalContent = { textAlign: 'center' as const, padding: '50px' };
const closeTmBtn = { marginTop: '30px', padding: '15px 30px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' } as const;
const overlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modalStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center' as const, maxWidth: '500px' };
const confirmBtn = { backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' } as const;
const cancelBtn = { backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' } as const;