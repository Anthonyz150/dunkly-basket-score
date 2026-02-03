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
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Pop-up Historique

  const [statsJoueurs, setStatsJoueurs] = useState<Record<string, { points: number, fautes: number }>>({});
  const [tmA, setTmA] = useState<boolean[]>([false, false]);
  const [tmB, setTmB] = useState<boolean[]>([false, false]);
  const [fautesA, setFautesA] = useState(0);
  const [fautesB, setFautesB] = useState(0);
  const [possession, setPossession] = useState<"A" | "B">("A");
  const [tmChrono, setTmChrono] = useState<number | null>(null);
  const [isTmActive, setIsTmActive] = useState(false);

  const [historique, setHistorique] = useState<any[]>([]);
  const [showFoulModal, setShowFoulModal] = useState(false);
  const [foulStep, setFoulStep] = useState(1);
  const [selectedEquipe, setSelectedEquipe] = useState<"A" | "B" | null>(null);
  const [selectedJoueurId, setSelectedJoueurId] = useState<string | null>(null);

  const adjustTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressDelayRef = useRef<NodeJS.Timeout | null>(null);

  // --- INITIALISATION ---
  useEffect(() => {
    const data = getFromLocal("matchs");
    const matchs = Array.isArray(data) ? data : [];
    const found = matchs.find((m: any) => m.id === matchId) || null;
    if (found) {
      setMatch(found);
      if (found.config?.tempsInitial) setChrono(found.config.tempsInitial);
      const initialStats: any = {};
      [...(found.joueursA || []), ...(found.joueursB || [])].forEach((j: any) => {
        initialStats[j.id] = { points: 0, fautes: 0 };
      });
      setStatsJoueurs(initialStats);
    }
  }, [matchId]);

  // --- LOGIQUE CHRONO MATCH ---
  useEffect(() => {
    if (!isRunning || chrono <= 0) { if (chrono === 0) setIsRunning(false); return; }
    const interval = setInterval(() => setChrono(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  // --- LOGIQUE CHRONO TEMPS MORT ---
  useEffect(() => {
    if (!isTmActive || tmChrono === null || tmChrono <= 0) { if (tmChrono === 0) setIsTmActive(false); return; }
    const interval = setInterval(() => setTmChrono(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(interval);
  }, [isTmActive, tmChrono]);

  // --- ACTIONS ---
  const actionJoueur = (equipe: "A" | "B", joueurId: string, type: 'points' | 'fautes', valeur: number, label?: string) => {
    if (valeur > 0) {
      const joueur = [...match.joueursA, ...match.joueursB].find(j => j.id === joueurId);
      const nouvelleAction = {
        id: Date.now(),
        joueurId,
        joueurNom: joueur?.nom,
        equipe,
        type,
        valeur,
        label: label || (type === 'points' ? `+${valeur} pts` : "Faute"),
        temps: formatTime(chrono),
        periode: quartTemps
      };
      setHistorique(prev => [nouvelleAction, ...prev]);
    }

    setStatsJoueurs(prev => {
      const current = prev[joueurId] || { points: 0, fautes: 0 };
      return { ...prev, [joueurId]: { ...current, [type]: Math.max(0, current[type] + valeur) } };
    });

    if (type === 'points') modifierScore(equipe, valeur);

    if (type === 'fautes') {
      if (valeur > 0) {
        if (equipe === "A") setFautesA(prev => Math.min(5, prev + 1));
        else setFautesB(prev => Math.min(5, prev + 1));
      } else {
        if (equipe === "A") setFautesA(prev => Math.max(0, prev - 1));
        else setFautesB(prev => Math.max(0, prev - 1));
      }
    }
  };

  const modifierScore = (equipe: "A" | "B", pts: number) => {
    if (!match) return;
    const key = equipe === "A" ? "scoreA" : "scoreB";
    setMatch((prev: any) => ({ ...prev, [key]: Math.max(0, prev[key] + pts) }));
  };

  const supprimerAction = (action: any) => {
    actionJoueur(action.equipe, action.joueurId, action.type, -action.valeur);
    setHistorique(prev => prev.filter(a => a.id !== action.id));
  };

  const validerFautePopup = (typeLabel: string) => {
    if (selectedEquipe && selectedJoueurId) {
      actionJoueur(selectedEquipe, selectedJoueurId, 'fautes', 1, `Faute ${typeLabel}`);
      setShowFoulModal(false);
      setFoulStep(1);
      setSelectedEquipe(null);
      setSelectedJoueurId(null);
    }
  };

  const toggleTM = (equipe: "A" | "B", index: number) => {
    setIsRunning(false); 
    if (equipe === "A") {
      const newTm = [...tmA]; newTm[index] = !newTm[index]; setTmA(newTm);
      if (newTm[index]) { setTmChrono(60); setIsTmActive(true); }
    } else {
      const newTm = [...tmB]; newTm[index] = !newTm[index]; setTmB(newTm);
      if (newTm[index]) { setTmChrono(60); setIsTmActive(true); }
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const startAdjusting = (dir: "UP" | "DOWN") => {
    const apply = (v: number) => setChrono(p => {
        const n = p + v; 
        return n < 0 ? 0 : n > (match?.config?.tempsInitial || 600) ? (match?.config?.tempsInitial || 600) : n;
    });
    apply(dir === "UP" ? 1 : -1);
    longPressDelayRef.current = setTimeout(() => {
      adjustTimerRef.current = setInterval(() => apply(dir === "UP" ? 5 : -5), 200);
    }, 400);
  };

  const stopAdjusting = () => {
    if (adjustTimerRef.current) clearInterval(adjustTimerRef.current);
    if (longPressDelayRef.current) clearTimeout(longPressDelayRef.current);
  };

  const passerPeriodeSuivante = () => {
    const nextP = quartTemps + 1;
    setQuartTemps(nextP);
    setChrono(match?.config?.tempsInitial || 600);
    setFautesA(0); setFautesB(0);
    setIsRunning(false); setShowPeriodModal(false);
  };

  const finaliserLeMatch = () => {
    if (!match) return;
    if (confirm("Clôturer le match et enregistrer le résultat ?")) {
      const data = (getFromLocal("matchs") || []) as any[];
      const updatedMatch = { ...match, statsFinales: statsJoueurs, status: 'termine', dateFin: new Date().toISOString() };
      saveToLocal("matchs", data.map((m: any) => m.id === matchId ? updatedMatch : m));
      router.push("/matchs/resultats");
    }
  };

  if (!match) return <div style={{ padding: '20px' }}>Chargement...</div>;

  return (
    <div style={layoutWrapper}>
      
      {/* OVERLAY TEMPS MORT */}
      {isTmActive && (
        <div style={tmOverlayStyle}>
          <div style={tmModalContent}>
            <h2 style={{ fontSize: '2rem' }}>TEMPS MORT</h2>
            <div style={{ fontSize: '12rem', fontWeight: '900', color: (tmChrono || 0) <= 5 ? '#ef4444' : '#F97316' }}>{tmChrono}s</div>
            <button onClick={() => setIsTmActive(false)} style={closeTmBtn}>REPRENDRE LE JEU</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <button onClick={() => setPossession(prev => prev === "A" ? "B" : "A")} style={possessionBtn}>
          POSSESSION {possession === "A" ? "◀ " + (match.clubA) : (match.clubB) + " ▶"}
        </button>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => { setIsRunning(false); setShowFoulModal(true); }} style={foulTriggerBtn}>SIFFLER FAUTE 🚩</button>
          <button onClick={() => setShowHistoryModal(true)} style={historyTriggerBtn}>HISTORIQUE 🕒</button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            {!isRunning && (quartTemps < 4 ? <button onClick={() => setShowPeriodModal(true)} style={nextPeriodBtn}>FIN DE PÉRIODE</button> : <button onClick={finaliserLeMatch} style={finishMatchBtn}>TERMINER LE MATCH 🏁</button>)}
            <Link href="/matchs/a-venir" style={quitBtn}>QUITTER</Link>
        </div>
      </div>

      {/* SCOREBOARD */}
      <div style={mainCard}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={equipeNameStyle}>{match.clubA}</h2>
            <div style={scoreValueStyle}>{match.scoreA}</div>
            <div style={fautesBox}>
              <span style={fautesDisplay(fautesA)}>{fautesA >= 4 && "🚩"} FAUTES : {fautesA}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {tmA.map((pris, i) => <button key={i} onClick={() => toggleTM("A", i)} style={tmSquareStyle(pris)}>TM</button>)}
            </div>
          </div>

          <div style={{ flex: 1.5, textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#64748b' }}>PÉRIODE {quartTemps}</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <button onMouseDown={() => startAdjusting("DOWN")} onMouseUp={stopAdjusting} style={arrowBtn}>▼</button>
              <div style={chronoDisplay}>{formatTime(chrono)}</div>
              <button onMouseDown={() => startAdjusting("UP")} onMouseUp={stopAdjusting} style={arrowBtn}>▲</button>
            </div>
            <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>{isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}</button>
          </div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={equipeNameStyle}>{match.clubB}</h2>
            <div style={scoreValueStyle}>{match.scoreB}</div>
            <div style={fautesBox}>
              <span style={fautesDisplay(fautesB)}>{fautesB >= 4 && "🚩"} FAUTES : {fautesB}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {tmB.map((pris, i) => <button key={i} onClick={() => toggleTM("B", i)} style={tmSquareStyle(pris)}>TM</button>)}
            </div>
          </div>
        </div>
      </div>

      {/* JOUEURS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '25px' }}>
        {[ {team: "A", players: match.joueursA}, {team: "B", players: match.joueursB} ].map((side, idx) => (
          <div key={idx} style={playerCard}>
            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {side.players?.filter((j: any) => !j.estCoach).map((j: any) => (
                <div key={j.id} style={playerRow}>
                  <div style={{ flex: 1 }}>
                    <span style={playerNum}>#{j.numero}</span>
                    <span style={playerName}>{j.nom}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={actionBlock}>
                       <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'fautes', -1)} style={minusBtn}>-</button>
                       <span style={{ fontWeight: '900', minWidth: '25px', textAlign: 'center' }}>{statsJoueurs[j.id]?.fautes || 0}F</span>
                    </div>
                    <div style={actionBlock}>
                      <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', -1)} style={minusBtn}>-</button>
                      <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 1)} style={pBtn}>+1</button>
                      <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 2)} style={pBtn}>+2</button>
                      <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 3)} style={pBtn}>+3</button>
                      <span style={totalPtsLabel}>{statsJoueurs[j.id]?.points || 0} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- POPUP HISTORIQUE --- */}
      {showHistoryModal && (
        <div style={overlayStyle}>
          <div style={historyModalStyle}>
            <button onClick={() => setShowHistoryModal(false)} style={closeCrossStyle}>✕</button>
            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Historique du match</h2>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {historique.map((act) => (
                <div key={act.id} style={historyItemStyle(act.equipe)}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{act.temps} - P{act.periode}</div>
                    <div style={{ fontWeight: 'bold' }}>{act.joueurNom} - {act.label}</div>
                  </div>
                  <button onClick={() => supprimerAction(act)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
              ))}
              {historique.length === 0 && <p style={{ color: '#94a3b8' }}>Aucune action</p>}
            </div>
          </div>
        </div>
      )}

      {/* MODALE FAUTE DÉTAILLÉE */}
      {showFoulModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Saisie de faute</h3>
            {foulStep === 1 && (
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={()=>{setSelectedEquipe("A"); setFoulStep(2)}} style={confirmBtn}>{match.clubA}</button>
                <button onClick={()=>{setSelectedEquipe("B"); setFoulStep(2)}} style={confirmBtn}>{match.clubB}</button>
              </div>
            )}
            {foulStep === 2 && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginTop:'20px'}}>
                {(selectedEquipe === "A" ? match.joueursA : match.joueursB).filter((j:any)=>!j.estCoach).map((j:any)=>(
                  <button key={j.id} onClick={()=>{setSelectedJoueurId(j.id); setFoulStep(3)}} style={pBtn}>#{j.numero}</button>
                ))}
              </div>
            )}
            {foulStep === 3 && (
              <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                <button onClick={()=>validerFautePopup("P")} style={confirmBtn}>PERSONNELLE (P)</button>
                <button onClick={()=>validerFautePopup("U")} style={{...confirmBtn, backgroundColor:'#F97316'}}>ANTI-SPORTIVE (U)</button>
                <button onClick={()=>validerFautePopup("T")} style={{...confirmBtn, backgroundColor:'#ef4444'}}>TECHNIQUE (T)</button>
              </div>
            )}
            <button onClick={() => {setShowFoulModal(false); setFoulStep(1)}} style={{...cancelBtn, marginTop:'20px'}}>FERMER</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- TOUS LES STYLES RESTAURÉS ET POPUP ---
const layoutWrapper = { padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' };
const historyModalStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '30px', position: 'relative' as const, width: '500px', maxWidth: '90vw', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', textAlign: 'center' as const };
const closeCrossStyle = { position: 'absolute' as const, top: '20px', right: '20px', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' };
const historyItemStyle = (eq: string) => ({ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', borderLeft: `5px solid ${eq === "A" ? "#1e293b" : "#F97316"}`, marginBottom: '8px', backgroundColor: '#f8fafc', borderRadius: '8px' });
const historyTriggerBtn = { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const mainCard = { backgroundColor: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const chronoDisplay = { fontSize: '7rem', fontWeight: '900', fontFamily: 'monospace' };
const scoreValueStyle = { fontSize: '6rem', fontWeight: '900' };
const equipeNameStyle = { fontSize: '1.5rem', fontWeight: '900', color: '#64748b' };
const fautesDisplay = (f: number) => ({ fontSize: '1.3rem', fontWeight: '900', color: f >= 4 ? '#ef4444' : '#1e293b' });
const fautesBox = { marginBottom: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '12px' };
const playerCard = { backgroundColor: 'white', borderRadius: '24px', padding: '20px' };
const playerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' };
const playerNum = { backgroundColor: '#1e293b', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: '900', marginRight: '10px' };
const playerName = { fontWeight: '700' };
const actionBlock = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '8px' };
const minusBtn = { border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', width: '24px' };
const pBtn = { border: 'none', backgroundColor: '#1e293b', color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold' };
const totalPtsLabel = { fontWeight: '900', color: '#F97316', minWidth: '50px', textAlign: 'right' as const };
const possessionBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const foulTriggerBtn = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const startBtn = (run: boolean) => ({ backgroundColor: run ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '12px', fontWeight: '900', marginTop: '10px', cursor: 'pointer' });
const arrowBtn = { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer' };
const tmSquareStyle = (p: boolean) => ({ width: '50px', height: '35px', borderRadius: '8px', border: 'none', backgroundColor: p ? '#ef4444' : '#cbd5e1', color: 'white', fontWeight: '900', cursor: 'pointer' });
const quitBtn = { textDecoration: 'none', padding: '12px 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontWeight: 'bold' };
const nextPeriodBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const finishMatchBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const tmOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 };
const tmModalContent = { textAlign: 'center' as const };
const closeTmBtn = { marginTop: '40px', padding: '20px 40px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const overlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000 };
const modalStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center' as const };
const confirmBtn = { backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtn = { backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };