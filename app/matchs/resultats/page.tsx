"use client";

import { useState, useEffect } from "react";
import { getFromLocal } from "@/lib/store";
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // On récupère TOUS les matchs de la liste globale
    const dataRaw = getFromLocal('matchs');
    const tousLesMatchs = Array.isArray(dataRaw) ? dataRaw : [];
    
    // On trie par date (le plus futur en haut, ou le plus récent terminé en haut)
    // Ici, on trie pour avoir les dates les plus récentes en premier
    const sorted = tousLesMatchs.sort((a: any, b: any) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    
    setMatchs(sorted);
  }, []);

  if (!isMounted) return null;

  // Fonction pour générer le badge de statut
  const renderStatus = (status: string) => {
    switch (status) {
      case 'termine':
        return <span style={{ ...statusBadge, backgroundColor: '#dcfce7', color: '#16a34a' }}>✅ TERMINÉ</span>;
      case 'en-cours':
        return <span style={{ ...statusBadge, backgroundColor: '#fef9c3', color: '#ca8a04' }}>⏱️ EN COURS</span>;
      default:
        return <span style={{ ...statusBadge, backgroundColor: '#f1f5f9', color: '#64748b' }}>📅 À VENIR</span>;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontWeight: '900', fontSize: '2.2rem' }}>🏀 TOUS LES MATCHS</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Suivi complet de la compétition</p>
        </div>
        <Link href="/matchs/a-venir" style={linkBtnStyle}>← Gestion des matchs</Link>
      </div>

      <div style={gridStyle}>
        {matchs.length > 0 ? (
          matchs.map((m, index) => (
            <div key={m.id || index} style={cardStyle}>
              <div style={infoSideStyle}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                  {renderStatus(m.status)}
                  <span style={dateBadgeStyle}>
                    {m.date ? m.date.replace('T', ' à ') : "Date non fixée"}
                  </span>
                </div>
                
                <div style={teamsRowStyle}>
                  <div style={teamBlock}>
                    <span style={m.status === 'termine' && m.scoreA > m.scoreB ? winName : teamNameStyle}>
                      {m.equipeA}
                    </span>
                    <span style={clubStyle}>{m.clubA}</span>
                  </div>

                  <div style={scoreBoxStyle}>
                    <span style={scoreValue}>{m.scoreA ?? 0}</span>
                    <span style={{ color: '#F97316', opacity: 0.5 }}>:</span>
                    <span style={scoreValue}>{m.scoreB ?? 0}</span>
                  </div>

                  <div style={teamBlock}>
                    <span style={m.status === 'termine' && m.scoreB > m.scoreA ? winName : teamNameStyle}>
                      {m.equipeB}
                    </span>
                    <span style={clubStyle}>{m.clubB}</span>
                  </div>
                </div>
                
                <div style={footerDetail}>
                  📍 {m.competition} {m.arbitre && ` | ⚖️ ${m.arbitre}`}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={emptyCardStyle}>
            <p>Aucun match programmé pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const gridStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '20px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' };
const infoSideStyle = { display: 'flex', flexDirection: 'column' as const };
const teamsRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' };

const teamBlock = { display: 'flex', flexDirection: 'column' as const, flex: 1, textAlign: 'center' as const };
const teamNameStyle = { fontWeight: '800', fontSize: '1.3rem', color: '#1e293b' };
const winName = { ...teamNameStyle, color: '#F97316' }; // Met en orange le vainqueur
const clubStyle = { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' as const, fontWeight: 'bold' };

const scoreBoxStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '0 30px' };
const scoreValue = { fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', fontFamily: 'monospace' };

const dateBadgeStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' };
const statusBadge = { padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900' };
const footerDetail = { fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' };

const emptyCardStyle = { textAlign: 'center' as const, padding: '60px', color: '#94a3b8' };
const linkBtnStyle = { textDecoration: 'none', color: '#F97316', fontWeight: 'bold' };