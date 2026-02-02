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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMatchFinished = chrono === 0 && quartTemps === 4;

  useEffect(() => {
    const matchs = getFromLocal("matchs") ?? [];
    const found = matchs.find((m: any) => m.id === matchId) || null;
    setMatch(found);
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

  const adjustTime = (delta: number) => {
    setChrono(prev => Math.max(0, Math.min(600, prev + delta)));
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
    const matchs = getFromLocal("matchs") ?? [];
    saveToLocal("matchs", matchs.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const handlePeriodChange = (direction: 'up' | 'down') => {
    const target = direction === 'up' ? quartTemps + 1 : quartTemps - 1;
    if (target < 1 || target > 4) return;
    setIsRunning(false); 
    setNextPeriod(target);
    setShowConfirmModal(true);
  };

  // --- LOGIQUE DE SAUVEGARDE CORRIGÉE ---
  const sauvegarderEtQuitter = () => {
    if (!match) return;

    // 1. On prépare l'objet du match terminé pour les résultats
    const matchTermine = { 
      ...match, 
      statut: "Terminé", 
      dateFin: new Date().toISOString() 
    };

    // 2. On enregistre dans la clé 'resultats' (lue par ta page Resultats)
    const anciensResultats = getFromLocal("resultats") ?? [];
    saveToLocal("resultats", [...anciensResultats, matchTermine]);

    // 3. On nettoie la liste des matchs à venir
    const matchsAvenir = getFromLocal("matchs") ?? [];
    const miseAJourAvenir = matchsAvenir.filter((m: any) => m.id !== matchId);
    saveToLocal("matchs", miseAJourAvenir);
    
    // 4. Redirection vers le dossier réel /resultats
    router.push("/resultats");
  };

  if (!match) return <div style={{ padding: '20px' }}>Chargement Dunkly...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      
      {showConfirmModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Passer à la période {nextPeriod} ?</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>Le chrono sera réinitialisé à 10:00.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => { setQuartTemps(nextPeriod!); setChrono(600); setShowConfirmModal(false); }} style={confirmBtn}>Confirmer</button>
              <button onClick={() => setShowConfirmModal(false)} style={cancelBtn}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontWeight: '900', fontSize: '1.8rem', color: '#1a1a1a', margin: 0 }}>TABLE DE MARQUE</h1>
          <p style={{ color: '#F97316', fontWeight: 'bold', margin: '5px 0 0 0' }}>{match.competition} • {match.arbitre}</p>
        </div>
        {!isMatchFinished && (
          <Link href="/matchs/a-venir" style={quitBtn}>✕ QUITTER</Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div style={mainCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <button onClick={() => handlePeriodChange('down')} style={periodArrowBtn}>◀</button>
            <span style={{ fontWeight: '900', fontSize: '1.4rem' }}>PÉRIODE {quartTemps}</span>
            <button onClick={() => handlePeriodChange('up')} style={periodArrowBtn}>▶</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{match.equipeA}</h2>
              <div style={{ fontSize: '7rem', fontWeight: '900', lineHeight: 1 }}>{match.scoreA}</div>
              <button onClick={() => modifierScore("A", -1)} style={corrBtn}>Correction -1</button>
            </div>

            <div style={{ flex: 1.5, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <button onMouseDown={() => startAdjusting(-1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} style={arrowTimeBtn}>▼</button>
                <div style={{ fontSize: '6rem', fontWeight: '900', fontFamily: 'monospace', color: isMatchFinished ? '#22c55e' : '#ef4444' }}>
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

            <div style={{ textAlign: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{match.equipeB}</h2>
              <div style={{ fontSize: '7rem', fontWeight: '900', lineHeight: 1 }}>{match.scoreB}</div>
              <button onClick={() => modifierScore("B", -1)} style={corrBtn}>Correction -1</button>
            </div>
          </div>
        </div>

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

// STYLES
const mainCard = { backgroundColor: '#fff', borderRadius: '20px', padding: '40px', border: '1px solid #e2e8f0' };
const scoreBtnGroup = { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', gap: '15px', border: '1px solid #e2e8f0' };
const ptBtn = { flex: 1, padding: '20px', fontSize: '2rem', fontWeight: '900', borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer' };
const arrowTimeBtn = { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', width: '50px', height: '50px', fontSize: '1.3rem', cursor: 'pointer' };
const corrBtn = { background: 'none', border: '1px solid #cbd5e1', color: '#64748b', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', marginTop: '10px' };
const periodArrowBtn = { background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' };
const startBtn = (isRunning: boolean) => ({ backgroundColor: isRunning ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '12px 40px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' });
const quitBtn = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 'bold' };
const saveFinishBtn = { backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' };
const modalOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' as const, width: '380px' };
const confirmBtn = { flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#333', border: 'none', fontWeight: 'bold', cursor: 'pointer' };