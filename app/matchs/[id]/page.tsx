"use client";

import { useState, useEffect, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EMarquePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const router = useRouter();
  
  const [match, setMatch] = useState<any>(null);
  const [chrono, setChrono] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [quartTemps, setQuartTemps] = useState(1);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Stats uniquement équipe
  const [fautesA, setFautesA] = useState(0);
  const [fautesB, setFautesB] = useState(0);
  
  const [tmChrono, setTmChrono] = useState<number | null>(null);
  const [isTmActive, setIsTmActive] = useState(false);
  const [possession, setPossession] = useState<"A" | "B">("A");
  const [historique, setHistorique] = useState<any[]>([]);

  const adjustTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- INITIALISATION ---
  useEffect(() => {
    chargerMatch();
  }, [matchId]);

  const chargerMatch = async () => {
    const { data } = await supabase.from('matchs').select('*').eq('id', matchId).single();
    if (data) {
      setMatch(data);
      if (data.config?.tempsInitial) setChrono(data.config.tempsInitial);
    }
  };

  const syncToDatabase = async (updatedFields: any) => {
    await supabase.from('matchs').update(updatedFields).eq('id', matchId);
  };

  // --- LOGIQUE CHRONO (Ref incluse pour précision) ---
  useEffect(() => {
    if (!isRunning || chrono <= 0) return;
    const interval = setInterval(() => setChrono(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  // Logique Temps Mort
  useEffect(() => {
    if (!isTmActive || tmChrono === null || tmChrono <= 0) return;
    const interval = setInterval(() => setTmChrono(prev => (prev !== null ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [isTmActive, tmChrono]);

  // --- ACTIONS ÉQUIPES (Anciennement actionJoueur) ---
  const modifierScore = async (equipe: "A" | "B", valeur: number) => {
    let newScoreA = match.scoreA || 0;
    let newScoreB = match.scoreB || 0;

    if (equipe === "A") newScoreA = Math.max(0, newScoreA + valeur);
    else newScoreB = Math.max(0, newScoreB + valeur);

    setMatch((prev: any) => ({ ...prev, scoreA: newScoreA, scoreB: newScoreB }));

    await syncToDatabase({
      scoreA: newScoreA,
      scoreB: newScoreB,
      status: 'en-cours'
    });

    if (valeur > 0) {
      setHistorique(prev => [{
        id: Date.now(),
        equipe,
        label: `+${valeur} pts`,
        temps: formatTime(chrono)
      }, ...prev]);
    }
  };

  const finaliserLeMatch = async () => {
    if (confirm("Clôturer le match définitivement ?")) {
      await syncToDatabase({
        status: 'termine',
        dateFin: new Date().toISOString()
      });
      router.push("/matchs/resultats");
    }
  };

  const lancerTempsMort = () => {
    setIsRunning(false);
    setTmChrono(60);
    setIsTmActive(true);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (!match) return <div style={layoutWrapper}>Chargement du match...</div>;

  return (
    <div style={layoutWrapper}>
      {/* OVERLAY TEMPS MORT (Lignes conservées) */}
      {isTmActive && (
        <div style={tmOverlayStyle}>
          <div style={tmModalContent}>
            <h2 style={{ fontSize: '2rem' }}>TEMPS MORT</h2>
            <div style={{ fontSize: '12rem', fontWeight: '900', color: '#F97316' }}>{tmChrono}s</div>
            <button onClick={() => setIsTmActive(false)} style={closeTmBtn}>REPRENDRE LE JEU</button>
          </div>
        </div>
      )}

      {/* HEADER ACTIONS */}
      <div style={headerActionStyle}>
        <button onClick={() => setPossession(prev => prev === "A" ? "B" : "A")} style={possessionBtn}>
          POSSESSION {possession === "A" ? "◀ " + match.clubA : match.clubB + " ▶"}
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={lancerTempsMort} style={tmBtnStyle}>⏱ TEMPS MORT</button>
          <button onClick={() => setShowHistoryModal(true)} style={historyTriggerBtn}>🕒 HISTORIQUE</button>
          <button onClick={finaliserLeMatch} style={finishMatchBtn}>TERMINER 🏁</button>
        </div>
      </div>

      {/* TABLEAU DE BORD CENTRAL */}
      <div style={mainCard}>
        <div style={scoreboardGrid}>
          <div style={teamBlockStyle}>
            <h2 style={equipeNameStyle}>{match.clubA}</h2>
            <div style={scoreValueStyle}>{match.scoreA || 0}</div>
            <div style={btnGroupCenter}>
              <button onClick={() => modifierScore("A", 1)} style={pBtn}>+1</button>
              <button onClick={() => modifierScore("A", 2)} style={pBtn}>+2</button>
              <button onClick={() => modifierScore("A", 3)} style={pBtn}>+3</button>
            </div>
            <div style={fautesBoxStyle}>
                <div style={miniLabel}>FAUTES D'ÉQUIPE</div>
                <div style={{fontSize: '3rem', fontWeight: '900', color: fautesA >= 4 ? '#ef4444' : 'white'}}>{fautesA}</div>
                <button onClick={() => setFautesA(prev => Math.min(5, prev + 1))} style={foulBtn}>+</button>
                <button onClick={() => setFautesA(prev => Math.max(0, prev - 1))} style={minusBtn}>-</button>
            </div>
          </div>

          <div style={chronoBlockStyle}>
            <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>PÉRIODE {quartTemps}</div>
            <div style={chronoDisplay}>{formatTime(chrono)}</div>
            <button onClick={() => setIsRunning(!isRunning)} style={startBtn(isRunning)}>
              {isRunning ? "⏸ PAUSE" : "▶ DÉMARRER"}
            </button>
          </div>

          <div style={teamBlockStyle}>
            <h2 style={equipeNameStyle}>{match.clubB}</h2>
            <div style={scoreValueStyle}>{match.scoreB || 0}</div>
            <div style={btnGroupCenter}>
              <button onClick={() => modifierScore("B", 1)} style={pBtn}>+1</button>
              <button onClick={() => modifierScore("B", 2)} style={pBtn}>+2</button>
              <button onClick={() => modifierScore("B", 3)} style={pBtn}>+3</button>
            </div>
            <div style={fautesBoxStyle}>
                <div style={miniLabel}>FAUTES D'ÉQUIPE</div>
                <div style={{fontSize: '3rem', fontWeight: '900', color: fautesB >= 4 ? '#ef4444' : 'white'}}>{fautesB}</div>
                <button onClick={() => setFautesB(prev => Math.min(5, prev + 1))} style={foulBtn}>+</button>
                <button onClick={() => setFautesB(prev => Math.max(0, prev - 1))} style={minusBtn}>-</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL HISTORIQUE (Conservé) */}
      {showHistoryModal && (
        <div style={overlayStyle} onClick={() => setShowHistoryModal(false)}>
          <div style={historyModalStyle} onClick={e => e.stopPropagation()}>
            <h2>Historique du match</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {historique.map(h => (
                <div key={h.id} style={historyItem(h.equipe)}>
                  <b>{h.temps}</b> - {h.equipe === "A" ? match.clubA : match.clubB} : {h.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES (Repris de ton code original) ---
const layoutWrapper = { padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerActionStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const mainCard = { backgroundColor: '#1e293b', color: 'white', borderRadius: '24px', padding: '30px', marginBottom: '20px' };
const scoreboardGrid = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const teamBlockStyle = { flex: 1, textAlign: 'center' as const };
const chronoBlockStyle = { flex: 1, textAlign: 'center' as const };
const scoreValueStyle = { fontSize: '7rem', fontWeight: '900', color: '#F97316' };
const chronoDisplay = { fontSize: '6rem', fontWeight: '900', fontFamily: 'monospace' };
const equipeNameStyle = { fontSize: '1.5rem', opacity: 0.8 };
const fautesBoxStyle = { backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', marginTop: '20px' };
const miniLabel = { fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '5px' };
const btnGroupCenter = { display: 'flex', gap: '8px', justifyContent: 'center' };
const pBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const foulBtn = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const minusBtn = { backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', marginLeft: '5px' };
const startBtn = (run: boolean) => ({ backgroundColor: run ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' });
const possessionBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const finishMatchBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const historyTriggerBtn = { backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const tmBtnStyle = { backgroundColor: '#475569', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const overlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 };
const historyModalStyle = { backgroundColor: 'white', color: '#1e293b', padding: '30px', borderRadius: '16px', width: '400px' };
const historyItem = (eq: string) => ({ padding: '8px', borderBottom: '1px solid #eee', borderLeft: `4px solid ${eq === 'A' ? '#1e293b' : '#F97316'}` });
const tmOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const tmModalContent = { textAlign: 'center' as const, color: '#1e293b' };
const closeTmBtn = { padding: '15px 30px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' };