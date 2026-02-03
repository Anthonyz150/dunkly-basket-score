"use client";

import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    // On récupère les données du tiroir 'resultats'
    const dataRaw = getFromLocal('resultats');
    let data = Array.isArray(dataRaw) ? dataRaw : [];

    // TRI : On s'assure que le match le plus récent est en haut
    // On compare les dates de fin (dateFin)
    data.sort((a: any, b: any) => {
      const dateA = new Date(a.dateFin || 0).getTime();
      const dateB = new Date(b.dateFin || 0).getTime();
      return dateB - dateA;
    });

    setMatchs(data);
  };

  const purgerResultats = () => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique des scores ?")) {
      saveToLocal('resultats', []);
      setMatchs([]);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="dashboard-wrapper" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER DE LA PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>✅ Résultats</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Historique des rencontres terminées.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/matchs/a-venir" style={backBtnStyle}>
            ← Retour aux matchs
          </Link>
          {matchs.length > 0 && (
            <button onClick={purgerResultats} style={purgeBtnStyle}>
              Effacer tout
            </button>
          )}
        </div>
      </div>

      {/* LISTE DES RÉSULTATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        {matchs.length > 0 ? (
          matchs.map((m, index) => (
            <div key={m.id || index} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={badgeStyle}>{m.competition || "Match Amical"}</span>
                  <span style={dateStyle}>
                    {m.dateFin ? `Terminé le ${new Date(m.dateFin).toLocaleDateString()} à ${new Date(m.dateFin).toLocaleTimeString([], {hour: '2h', minute:'2h'})}` : "Date inconnue"}
                  </span>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <span style={teamNameStyle}>{m.equipeA}</span>
                  <span style={{ color: '#94a3b8', margin: '0 10px', fontWeight: 'normal' }}>vs</span>
                  <span style={teamNameStyle}>{m.equipeB}</span>
                </div>
              </div>
              
              {/* BLOC SCORE */}
              <div style={scoreBoxStyle}>
                <span style={{ color: m.scoreA >= m.scoreB ? '#fff' : '#94a3b8' }}>{m.scoreA}</span>
                <span style={{ color: '#F97316', margin: '0 5px' }}>-</span>
                <span style={{ color: m.scoreB >= m.scoreA ? '#fff' : '#94a3b8' }}>{m.scoreB}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={emptyStateStyle}>
            <span style={{ fontSize: '3rem' }}>📁</span>
            <p style={{ fontWeight: '600', marginTop: '10px' }}>Aucun résultat enregistré.</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Terminez un match via l'e-marque pour le voir apparaître ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES CSS-IN-JS
const cardStyle = {
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '25px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s'
};

const scoreBoxStyle = {
  background: '#1e293b',
  padding: '15px 30px',
  borderRadius: '12px',
  fontWeight: '900',
  fontSize: '2rem',
  minWidth: '140px',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
};

const teamNameStyle = { fontWeight: '800', fontSize: '1.3rem', color: '#1e293b' };
const badgeStyle = { backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' as const };
const dateStyle = { fontSize: '0.85rem', color: '#94a3b8' };
const emptyStateStyle = { textAlign: 'center' as const, padding: '80px', backgroundColor: '#fff', borderRadius: '20px', border: '2px border-dashed #e2e8f0', color: '#94a3b8' };
const backBtnStyle = { padding: '10px 20px', color: '#1e293b', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' };
const purgeBtnStyle = { padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };