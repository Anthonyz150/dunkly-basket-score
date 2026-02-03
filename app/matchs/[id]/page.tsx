"use client";

import { useState, useEffect, useRef, use } from "react";
import { supabase } from "@/lib/supabase"; // Import Supabase
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [statsJoueurs, setStatsJoueurs] = useState<Record<string, { points: number, fautes: number }>>({});
  const [fautesA, setFautesA] = useState(0);
  const [fautesB, setFautesB] = useState(0);
  const [tmA, setTmA] = useState<boolean[]>([false, false]);
  const [tmB, setTmB] = useState<boolean[]>([false, false]);
  
  const [tmChrono, setTmChrono] = useState<number | null>(null);
  const [isTmActive, setIsTmActive] = useState(false);
  const [possession, setPossession] = useState<"A" | "B">("A");
  const [historique, setHistorique] = useState<any[]>([]);

  const adjustTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressDelayRef = useRef<NodeJS.Timeout | null>(null);

  // --- INITIALISATION SUPABASE ---
  useEffect(() => {
    chargerMatch();
  }, [matchId]);

  const chargerMatch = async () => {
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .eq('id', matchId)
      .single();

    if (data) {
      setMatch(data);
      if (data.config?.tempsInitial) setChrono(data.config.tempsInitial);
      if (data.statsFinales) setStatsJoueurs(data.statsFinales);
      // On pourrait aussi récupérer l'historique s'il est stocké en DB
    }
  };

  // --- SYNCHRONISATION TEMPS RÉEL (Update Database) ---
  const syncToDatabase = async (updatedFields: any) => {
    const { error } = await supabase
      .from('matchs')
      .update(updatedFields)
      .eq('id', matchId);
    if (error) console.error("Erreur de synchro:", error.message);
  };

  // --- LOGIQUE CHRONO ---
  useEffect(() => {
    if (!isRunning || chrono <= 0) return;
    const interval = setInterval(() => setChrono(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning, chrono]);

  // --- ACTIONS JOUEURS ---
  const actionJoueur = async (equipe: "A" | "B", joueurId: string, type: 'points' | 'fautes', valeur: number, label?: string) => {
    const newStats = { ...statsJoueurs };
    if (!newStats[joueurId]) newStats[joueurId] = { points: 0, fautes: 0 };
    
    newStats[joueurId][type] = Math.max(0, newStats[joueurId][type] + valeur);
    setStatsJoueurs(newStats);

    // Calcul des nouveaux scores et fautes d'équipe
    let newScoreA = match.scoreA;
    let newScoreB = match.scoreB;
    let newFautesA = fautesA;
    let newFautesB = fautesB;

    if (type === 'points') {
      if (equipe === "A") newScoreA += valeur; else newScoreB += valeur;
    }
    if (type === 'fautes') {
      if (equipe === "A") newFautesA = Math.max(0, newFautesA + valeur); 
      else newFautesB = Math.max(0, newFautesB + valeur);
      setFautesA(newFautesA);
      setFautesB(newFautesB);
    }

    // Mise à jour locale du match pour l'UI
    setMatch((prev: any) => ({ ...prev, scoreA: newScoreA, scoreB: newScoreB }));

    // Envoi à Supabase
    await syncToDatabase({
      scoreA: newScoreA,
      scoreB: newScoreB,
      statsFinales: newStats,
      status: 'en-cours' // Le match passe en "en-cours" dès la première action
    });

    // Historique local
    if (valeur > 0) {
      const joueur = [...match.joueursA, ...match.joueursB].find(j => j.id === joueurId);
      setHistorique(prev => [{
        id: Date.now(),
        joueurNom: joueur?.nom,
        equipe,
        label: label || (type === 'points' ? `+${valeur} pts` : "Faute"),
        temps: formatTime(chrono)
      }, ...prev]);
    }
  };

  const finaliserLeMatch = async () => {
    if (confirm("Clôturer le match définitivement ?")) {
      await syncToDatabase({
        status: 'termine',
        dateFin: new Date().toISOString(),
        statsFinales: statsJoueurs
      });
      router.push("/matchs/resultats");
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (!match) return <div style={layoutWrapper}>Chargement du match...</div>;

  return (
    <div style={layoutWrapper}>
      {/* OVERLAY TEMPS MORT */}
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
          <button onClick={() => setShowHistoryModal(true)} style={historyTriggerBtn}>🕒 HISTORIQUE</button>
          <button onClick={finaliserLeMatch} style={finishMatchBtn}>TERMINER 🏁</button>
        </div>
      </div>

      {/* TABLEAU DE BORD CENTRAL */}
      <div style={mainCard}>
        <div style={scoreboardGrid}>
          <div style={teamBlockStyle}>
            <h2 style={equipeNameStyle}>{match.clubA}</h2>
            <div style={scoreValueStyle}>{match.scoreA}</div>
            <div style={fautesBox}>EQUIPE: {fautesA}</div>
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
            <div style={scoreValueStyle}>{match.scoreB}</div>
            <div style={fautesBox}>EQUIPE: {fautesB}</div>
          </div>
        </div>
      </div>

      {/* LISTE DES JOUEURS - GRILLE 2 COLONNES */}
      <div style={playerGrid}>
        {[ { team: "A", players: match.joueursA, club: match.clubA }, { team: "B", players: match.joueursB, club: match.clubB } ].map((side) => (
          <div key={side.team} style={playerCard}>
            <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>{side.club}</h3>
            {side.players?.filter((j: any) => !j.estCoach).map((j: any) => (
              <div key={j.id} style={playerRow}>
                <div style={{ flex: 1 }}>
                  <span style={playerNum}>#{j.numero}</span>
                  <span style={playerName}>{j.nom}</span>
                </div>
                <div style={btnGroup}>
                  <div style={statCircle}>{statsJoueurs[j.id]?.fautes || 0}F</div>
                  <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'fautes', 1)} style={foulBtn}>F</button>
                  <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 1)} style={pBtn}>+1</button>
                  <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 2)} style={pBtn}>+2</button>
                  <button onClick={() => actionJoueur(side.team as "A"|"B", j.id, 'points', 3)} style={pBtn}>+3</button>
                  <div style={ptsBadge}>{statsJoueurs[j.id]?.points || 0} pts</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MODAL HISTORIQUE */}
      {showHistoryModal && (
        <div style={overlayStyle} onClick={() => setShowHistoryModal(false)}>
          <div style={historyModalStyle} onClick={e => e.stopPropagation()}>
            <h2>Historique du match</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {historique.map(h => (
                <div key={h.id} style={historyItem(h.equipe)}>
                  <b>{h.temps}</b> - {h.joueurNom} : {h.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const layoutWrapper = { padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerActionStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const mainCard = { backgroundColor: '#1e293b', color: 'white', borderRadius: '24px', padding: '30px', marginBottom: '20px' };
const scoreboardGrid = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const teamBlockStyle = { flex: 1, textAlign: 'center' as const };
const chronoBlockStyle = { flex: 1, textAlign: 'center' as const };
const scoreValueStyle = { fontSize: '7rem', fontWeight: '900', color: '#F97316' };
const chronoDisplay = { fontSize: '6rem', fontWeight: '900', fontFamily: 'monospace' };
const equipeNameStyle = { fontSize: '1.5rem', opacity: 0.8 };
const fautesBox = { backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '8px', display: 'inline-block' };
const playerGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const playerCard = { backgroundColor: 'white', padding: '20px', borderRadius: '16px' };
const playerRow = { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' };
const playerNum = { backgroundColor: '#475569', color: 'white', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontWeight: 'bold' };
const playerName = { fontWeight: 'bold' };
const btnGroup = { display: 'flex', gap: '8px', alignItems: 'center' };
const pBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const foulBtn = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' };
const ptsBadge = { fontWeight: '900', color: '#F97316', width: '50px', textAlign: 'right' as const };
const statCircle = { width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' };
const startBtn = (run: boolean) => ({ backgroundColor: run ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' });
const possessionBtn = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const finishMatchBtn = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const historyTriggerBtn = { backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' };
const overlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 };
const historyModalStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px' };
const historyItem = (eq: string) => ({ padding: '8px', borderBottom: '1px solid #eee', borderLeft: `4px solid ${eq === 'A' ? '#1e293b' : '#F97316'}` });
const tmOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const tmModalContent = { textAlign: 'center' as const };
const closeTmBtn = { padding: '15px 30px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' };