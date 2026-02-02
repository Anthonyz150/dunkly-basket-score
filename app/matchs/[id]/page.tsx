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
  const [chrono, setChrono] = useState(600); // Valeur par défaut
  const [isRunning, setIsRunning] = useState(false);
  const [quartTemps, setQuartTemps] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextPeriod, setNextPeriod] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMatchFinished = chrono === 0 && quartTemps === 4;

  // CHARGEMENT INITIAL DU MATCH ET DU CHRONO CONFIGURÉ
  useEffect(() => {
    const data = getFromLocal("matchs");
    const matchs = Array.isArray(data) ? data : [];
    const found = matchs.find((m: any) => m.id === matchId) || null;
    
    if (found) {
      setMatch(found);
      // On applique le temps défini lors de la programmation (ex: 5min = 300s)
      if (found.config && found.config.tempsInitial) {
        setChrono(found.config.tempsInitial);
      }
    }
  }, [matchId]);

  // LOGIQUE DU COMPTE À REBOURS
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

  const adjustTime = (delta: number) => {
    // On empêche de dépasser le temps initial du match lors d'un ajustement manuel
    const limit = match?.config?.tempsInitial || 600;
    setChrono(prev => Math.max(0, Math.min(limit, prev + delta)));
  };

  const startAdjusting = (delta: number) => {
    adjustTime(delta);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        adjustTime(delta * 5); 
      }, 500); 
    }, 400); 
  };

  const stopAdjusting = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
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

  const handlePeriodChange = (direction: 'up' | 'down') => {
    const target = direction === 'up' ? quartTemps + 1 : quartTemps - 1;
    if (target < 1 || target > 4) return;
    setIsRunning(false); 
    setNextPeriod(target);
    setShowConfirmModal(true);
  };

  const sauvegarderEtQuitter = () => {
    if (!match) return;
    const dataRes = getFromLocal("resultats");
    const anciensResultats = Array.isArray(dataRes) ? dataRes : [];
    const matchTermine = { 
      ...match, 
      statut: "Terminé", 
      dateFin: new Date().toISOString() 
    };
    saveToLocal("resultats", [...anciensResultats, matchTermine]);
    const dataMatchs = getFromLocal("matchs");
    const matchsAvenir = Array.isArray(dataMatchs) ? dataMatchs : [];
    saveToLocal("matchs", matchsAvenir.filter((m: any) => m.id !== matchId));
    router.push("/resultats");
  };

  if (!match) return <div style={{ padding: '20px', fontWeight: 'bold' }}>Chargement Dunkly...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* MODALE DE CHANGEMENT DE PÉRIODE AVEC RESET DYNAMIQUE DU CHRONO */}
      {showConfirmModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ margin: '0 0 10px 0' }}>Passer à la période {nextPeriod} ?</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              Le chrono sera réinitialisé à {formatTime(match.config?.tempsInitial || 600)}.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => { 
                  setQuartTemps(nextPeriod!); 
                  setChrono(match.config?.tempsInitial || 600); // Utilise la durée programmée
                  setShowConfirmModal(false); 
                }} 
                style={confirmBtn}
              >Confirmer</button>
              <button onClick={() => setShowConfirmModal(false)} style={cancelBtn}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER AVEC INFOS MATCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontWeight: '900', fontSize: '1.8rem', color: '#1a1a1a', margin: 0 }}>TABLE DE MARQUE</h1>
          <p style={{ color: '#F97316', fontWeight: 'bold', margin: '5px 0 0 0', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            {match.clubA} vs {match.clubB} • {match.competition}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>🏁 Arbitre : {match.arbitre}</p>
        </div>
        {!isMatchFinished && (
          <Link href="/matchs/a-venir" style={quitBtn}>✕ QUITTER</Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* CARTE PRINCIPALE : CHRONO ET SCORES */}
        <div style={mainCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <button onClick={() => handlePeriodChange('down')} style={periodArrowBtn}>◀</button>
            <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '1px' }}>PÉRIODE {quartTemps}</span>
            <button onClick={() => handlePeriodChange('up')} style={periodArrowBtn}>▶</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
            
            {/* DOMICILE */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={clubLabelStyle}>{match.clubA}</div>
              <h2 style={equipeNameStyle}>{match.equipeA}</h2>
              <div style={scoreValueStyle}>{match.scoreA}</div>
              <button onClick={() => modifierScore("A", -1)} style={corrBtn}>Correction -1</button>
            </div>

            {/* CHRONOMÈTRE CENTRAL */}
            <div style={{ flex: 1.5, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <button onMouseDown={() => startAdjusting(-1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} style={arrowTimeBtn}>▼</button>
                <div style={{ 
                  fontSize: '6.5rem', 
                  fontWeight: '900', 
                  fontFamily: 'monospace', 
                  color: isMatchFinished ? '#22c55e' : '#ef4444',
                  textShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  {formatTime(chrono)}
                </div>
                <button onMouseDown={() => startAdjusting(1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} style={arrowTimeBtn}>▲</button>
              </div>
              <div style={{ marginTop: '20px' }}>
                {isMatchFinished ? (
                  <button onClick={sauvegarderEtQuitter} style={saveFinishBtn}>💾 TERMINER ET SAUVEGARDER</button>
                ) : (
                  <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>
                    {isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}
                  </button>
                )}
              </div>
            </div>

            {/* EXTÉRIEUR */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={clubLabelStyle}>{match.clubB}</div>
              <h2 style={equipeNameStyle}>{match.equipeB}</h2>
              <div style={scoreValueStyle}>{match.scoreB}</div>
              <button onClick={() => modifierScore("B", -1)} style={corrBtn}>Correction -1</button>
            </div>

          </div>
        </div>

        {/* CLAVIER DE SCORING */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
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
    </div>
  );
}

// --- STYLES ---
const mainCard = { backgroundColor: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const clubLabelStyle = { fontSize: '0.9rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' };
const equipeNameStyle = { fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', margin: '0 0 10px 0' };
const scoreValueStyle = { fontSize: '7.5rem', fontWeight: '900', lineHeight: 1, color: '#1a1a1a' };
const scoreBtnGroup = { backgroundColor: '#fff', borderRadius: '20px', padding: '20px', display: 'flex', gap: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const ptBtn = { flex: 1, padding: '25px', fontSize: '2.2rem', fontWeight: '900', borderRadius: '16px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer' };
const arrowTimeBtn = { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', width: '54px', height: '54px', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const corrBtn = { background: '#f1f5f9', border: 'none', color: '#64748b', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' };
const periodArrowBtn = { background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' };
const startBtn = (isRunning: boolean) => ({ backgroundColor: isRunning ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '16px 50px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1.2rem', boxShadow: isRunning ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(34, 197, 94, 0.4)' });
const quitBtn = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem' };
const saveFinishBtn = { backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '18px 35px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' };
const modalOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', textAlign: 'center' as const, width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const confirmBtn = { flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 'bold', cursor: 'pointer' };