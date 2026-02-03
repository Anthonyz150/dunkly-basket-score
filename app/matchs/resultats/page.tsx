"use client";

import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // On récupère les résultats stockés par l'E-Marque
    const dataRaw = getFromLocal('resultats');
    const data = Array.isArray(dataRaw) ? dataRaw : [];
    
    // On trie pour avoir le match le plus récent en premier
    const sortedData = data.sort((a: any, b: any) => 
      new Date(b.dateFin || 0).getTime() - new Date(a.dateFin || 0).getTime()
    );
    
    setMatchs(sortedData);
  }, []);

  const purgerResultats = () => {
    if(confirm("Voulez-vous vraiment effacer l'historique des résultats ?")) {
      saveToLocal('resultats', []);
      setMatchs([]);
    }
  };

  if (!isMounted) return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontWeight: '900', fontSize: '2rem' }}>✅ RÉSULTATS</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Historique des matchs terminés</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link href="/matchs/a-venir" style={linkBtnStyle}>← Retour</Link>
          {matchs.length > 0 && (
            <button onClick={purgerResultats} style={purgeBtnStyle}>Effacer tout</button>
          )}
        </div>
      </div>

      <div style={gridStyle}>
        {matchs.length > 0 ? (
          matchs.map((m, index) => (
            <div key={index} style={cardStyle}>
              <div style={infoSideStyle}>
                <span style={dateBadgeStyle}>
                  {m.dateFin ? new Date(m.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Date inconnue"}
                </span>
                <span style={competitionStyle}>{m.competition || "Championnat"}</span>
                <div style={teamsRowStyle}>
                  <span style={teamNameStyle}>{m.equipeA}</span>
                  <span style={{ color: '#cbd5e1', fontWeight: 'normal' }}>vs</span>
                  <span style={teamNameStyle}>{m.equipeB}</span>
                </div>
              </div>
              
              <div style={scoreBoxStyle}>
                <span style={m.scoreA >= m.scoreB ? winScore : loseScore}>{m.scoreA}</span>
                <span style={{ color: '#F97316' }}>-</span>
                <span style={m.scoreB >= m.scoreA ? winScore : loseScore}>{m.scoreB}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={emptyCardStyle}>
            <span style={{ fontSize: '3rem' }}>📂</span>
            <p>Aucun match enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES 
const containerStyle = { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const gridStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '20px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const infoSideStyle = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const teamsRowStyle = { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '5px' };
const teamNameStyle = { fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' };
const dateBadgeStyle = { fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' as const };
const competitionStyle = { fontSize: '0.85rem', color: '#F97316', fontWeight: 'bold' };
const scoreBoxStyle = { background: '#1e293b', padding: '15px 25px', borderRadius: '15px', display: 'flex', gap: '10px', alignItems: 'center', fontFamily: 'monospace', fontSize: '2rem', fontWeight: '900' };
const winScore = { color: '#fff' };
const loseScore = { color: '#64748b' };
const emptyCardStyle = { textAlign: 'center' as const, padding: '100px', backgroundColor: '#f8fafc', borderRadius: '30px', color: '#94a3b8', border: '2px dashed #e2e8f0' };
const linkBtnStyle = { textDecoration: 'none', color: '#1e293b', fontWeight: 'bold' };
const purgeBtnStyle = { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };