"use client";

import { useState, useEffect, use } from "react";
import { getFromLocal } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DetailMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const allMatchs = (getFromLocal("matchs") || []) as any[];
    const found = allMatchs.find((m: any) => m.id === matchId);
    if (found) {
      setMatch(found);
    }
  }, [matchId]);

  if (!match) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontFamily: 'sans-serif' }}>
        <p>Chargement du match...</p>
        <Link href="/matchs/resultats" style={{ color: '#F97316' }}>Retour aux résultats</Link>
      </div>
    );
  }

  const getFautesStyle = (f: number) => ({
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    color: f >= 5 ? '#ef4444' : '#1e293b',
    backgroundColor: f >= 5 ? '#fee2e2' : 'transparent',
    borderRadius: '4px',
    padding: '4px'
  });

  return (
    <div style={containerStyle}>
      {/* Barre de navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => router.back()} style={backBtn}>← RETOUR</button>
        <div style={badgeTermine}>MATCH TERMINÉ ✅</div>
      </div>

      {/* SCORE FINAL */}
      <div style={scoreCard}>
        <div style={teamSide}>
          <h2 style={teamTitle}>{match.clubA}</h2>
          <p style={teamSub}>{match.equipeA}</p>
        </div>
        
        <div style={scoreCenter}>
          <div style={scoreDisplay}>{match.scoreA} - {match.scoreB}</div>
          <div style={dateLabel}>
            {new Date(match.dateFin || match.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>

        <div style={teamSide}>
          <h2 style={teamTitle}>{match.clubB}</h2>
          <p style={teamSub}>{match.equipeB}</p>
        </div>
      </div>

      {/* --- BLOC ADRESSE / LIEU DU MATCH --- */}
      {match.lieu && (
        <div style={lieuContainer}>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.lieu)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={lieuLink}
          >
            📍 Lieu de la rencontre : <strong>{match.lieu}</strong> 
            <span style={{ marginLeft: '8px', fontSize: '0.8rem', opacity: 0.8 }}>(Ouvrir dans Maps ↗)</span>
          </a>
        </div>
      )}

      {/* GRILLE DES STATISTIQUES JOUEURS */}
      <div style={statsGrid}>
        {/* ÉQUIPE A */}
        <div style={tableContainer}>
          <h3 style={tableHeader}>{match.clubA}</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={thRow}>
                <th style={thL}>JOUEUR</th>
                <th style={thC}>PTS</th>
                <th style={thC}>FAUTES</th>
              </tr>
            </thead>
            <tbody>
              {match.joueursA?.filter((j: any) => !j.estCoach).map((j: any) => (
                <tr key={j.id} style={trStyle}>
                  <td style={tdL}><span style={numBadge}>#{j.numero}</span> {j.nom}</td>
                  <td style={tdPts}>{match.statsFinales?.[j.id]?.points || 0}</td>
                  <td style={getFautesStyle(match.statsFinales?.[j.id]?.fautes || 0)}>
                    {match.statsFinales?.[j.id]?.fautes || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ÉQUIPE B */}
        <div style={tableContainer}>
          <h3 style={tableHeader}>{match.clubB}</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={thRow}>
                <th style={thL}>JOUEUR</th>
                <th style={thC}>PTS</th>
                <th style={thC}>FAUTES</th>
              </tr>
            </thead>
            <tbody>
              {match.joueursB?.filter((j: any) => !j.estCoach).map((j: any) => (
                <tr key={j.id} style={trStyle}>
                  <td style={tdL}><span style={numBadge}>#{j.numero}</span> {j.nom}</td>
                  <td style={tdPts}>{match.statsFinales?.[j.id]?.points || 0}</td>
                  <td style={getFautesStyle(match.statsFinales?.[j.id]?.fautes || 0)}>
                    {match.statsFinales?.[j.id]?.fautes || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const backBtn = { backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' as const, cursor: 'pointer', color: '#64748b' };
const badgeTermine = { backgroundColor: '#22c55e', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' as const };
const scoreCard = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#1e293b', color: 'white', padding: '40px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const teamSide = { flex: 1, textAlign: 'center' as const };
const teamTitle = { fontSize: '2rem', margin: '0 0 5px 0' };
const teamSub = { fontSize: '1rem', opacity: 0.7, margin: 0 };
const scoreCenter = { flex: 1, textAlign: 'center' as const };
const scoreDisplay = { fontSize: '5rem', fontWeight: '900', color: '#F97316', lineHeight: 1 };
const dateLabel = { marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 };

// Nouveau style pour le bloc adresse
const lieuContainer = { backgroundColor: 'white', padding: '15px 25px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0', textAlign: 'center' as const };
const lieuLink = { color: '#1e293b', textDecoration: 'none', fontSize: '0.95rem' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' };
const tableContainer = { backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const tableHeader = { fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', borderBottom: '3px solid #F97316', paddingBottom: '10px', color: '#1e293b' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const };
const thRow = { borderBottom: '1px solid #e2e8f0' };
const thL = { textAlign: 'left' as const, padding: '10px', color: '#64748b', fontSize: '0.8rem' };
const thC = { textAlign: 'center' as const, padding: '10px', color: '#64748b', fontSize: '0.8rem' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdL = { padding: '15px 10px', fontWeight: '600', fontSize: '0.95rem' };
const tdPts = { textAlign: 'center' as const, fontWeight: '900', fontSize: '1.1rem', color: '#F97316' };
const numBadge = { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', marginRight: '10px', fontSize: '0.8rem' };