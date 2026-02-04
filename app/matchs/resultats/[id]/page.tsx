"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ matchs: 0, points: 0 });

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    setLoading(true);
    const { data: matchs } = await supabase
      .from('matchs')
      .select('*')
      .eq('status', 'termine');

    if (matchs) {
      const compilation: Record<string, any> = {};
      let totalPts = 0;

      matchs.forEach(m => {
        totalPts += (m.scoreA + m.scoreB);
        
        // Initialiser ou mettre à jour Club A
        if (!compilation[m.clubA]) compilation[m.clubA] = { nom: m.clubA, v: 0, d: 0, pts: 0, m: 0 };
        compilation[m.clubA].m += 1;
        compilation[m.clubA].pts += m.scoreA;
        
        // Initialiser ou mettre à jour Club B
        if (!compilation[m.clubB]) compilation[m.clubB] = { nom: m.clubB, v: 0, d: 0, pts: 0, m: 0 };
        compilation[m.clubB].m += 1;
        compilation[m.clubB].pts += m.scoreB;

        // Calcul victoire / défaite
        if (m.scoreA > m.scoreB) {
          compilation[m.clubA].v += 1;
          compilation[m.clubB].d += 1;
        } else {
          compilation[m.clubB].v += 1;
          compilation[m.clubA].d += 1;
        }
      });

      setTotals({ matchs: matchs.length, points: totalPts });
      setStats(Object.values(compilation).sort((a, b) => b.v - a.v));
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      {/* SECTION HERO / CHIFFRES CLÉS */}
      <div style={heroSection}>
        <h1 style={titleStyle}>Tableau de Bord e-Marque</h1>
        <div style={badgeGrid}>
          <div style={miniBadge}>🏀 {totals.matchs} Matchs terminés</div>
          <div style={miniBadge}>🔥 {totals.points} Points inscrits au total</div>
        </div>
      </div>

      <div style={mainGrid}>
        {/* COLONNE GAUCHE : CLASSEMENT ÉQUIPES */}
        <div style={statsCard}>
          <h2 style={cardTitle}>🏆 Classement des Équipes</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={thRow}>
                <th style={thL}>CLUB</th>
                <th style={thC}>M</th>
                <th style={thC}>V</th>
                <th style={thC}>D</th>
                <th style={thC}>MOY. PTS</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((team, index) => (
                <tr key={team.nom} style={trStyle}>
                  <td style={tdL}>
                    <span style={rankStyle(index)}>{index + 1}</span>
                    {team.nom}
                  </td>
                  <td style={tdC}>{team.m}</td>
                  <td style={{ ...tdC, color: '#22c55e', fontWeight: 'bold' }}>{team.v}</td>
                  <td style={{ ...tdC, color: '#ef4444' }}>{team.d}</td>
                  <td style={tdC}>{(team.pts / team.m).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.length === 0 && <p style={emptyText}>Aucun match terminé pour le moment.</p>}
        </div>

        {/* COLONNE DROITE : ACTIONS RAPIDES */}
        <div style={actionColumn}>
          <Link href="/matchs/nouveau" style={primaryBtn}>+ Nouveau Match</Link>
          <Link href="/matchs/resultats" style={secondaryBtn}>Consulter les Résultats</Link>
          
          <div style={infoBox}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Dernière mise à jour</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Les statistiques sont calculées en temps réel à partir des matchs enregistrés dans Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1e293b' };
const heroSection = { textAlign: 'center' as const, marginBottom: '50px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px', color: '#1e293b' };
const badgeGrid = { display: 'flex', gap: '15px', justifyContent: 'center' };
const miniBadge = { backgroundColor: '#f1f5f9', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem' };

const mainGrid = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' };

const statsCard = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const cardTitle = { fontSize: '1.3rem', fontWeight: '800', marginBottom: '25px', color: '#1e293b' };

const tableStyle = { width: '100%', borderCollapse: 'collapse' as const };
const thRow = { borderBottom: '2px solid #f1f5f9' };
const thL = { textAlign: 'left' as const, padding: '15px', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' };
const thC = { textAlign: 'center' as const, padding: '15px', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' };
const trStyle = { borderBottom: '1px solid #f8fafc' };
const tdL = { padding: '18px 15px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' };
const tdC = { padding: '18px 15px', textAlign: 'center' as const, fontSize: '1rem' };
const rankStyle = (i: number) => ({
  backgroundColor: i === 0 ? '#FEF3C7' : '#f1f5f9',
  color: i === 0 ? '#92400E' : '#475569',
  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
});

const actionColumn = { display: 'flex', flexDirection: 'column' as const, gap: '15px' };
const primaryBtn = { backgroundColor: '#F97316', color: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center' as const, textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' };
const secondaryBtn = { backgroundColor: '#1e293b', color: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center' as const, textDecoration: 'none', fontWeight: 'bold' };
const infoBox = { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginTop: '10px', border: '1px solid #e2e8f0' };
const emptyText = { textAlign: 'center' as const, color: '#94a3b8', padding: '40px' };