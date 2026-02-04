'use client';

import { useState, useEffect, use as reactUse } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DetailCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = reactUse(params);
  const compId = resolvedParams?.id;
  const router = useRouter();

  const [competition, setCompetition] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [matchsTermines, setMatchsTermines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (compId) chargerDonnees();
  }, [compId]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const { data: comp } = await supabase.from('competitions').select('*').eq('id', compId).single();
      const { data: listeClubs } = await supabase.from('equipes_clubs').select('*').order('nom');
      
      if (comp) {
        const { data: matchs } = await supabase
          .from('matchs')
          .select('*')
          .eq('competition', comp.nom)
          .eq('status', 'termine');

        setCompetition(comp);
        setMatchsTermines(matchs || []);
      }
      setClubs(listeClubs || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculerClassement = () => {
    if (!competition?.equipes_engagees) return [];
    const stats: Record<string, any> = {};
    
    competition.equipes_engagees.forEach((eq: any) => {
      const key = `${eq.clubNom}-${eq.nom}`;
      stats[key] = { ...eq, m: 0, v: 0, d: 0, ptsPlus: 0, ptsMoins: 0, points: 0 };
    });

    matchsTermines.forEach(m => {
      const keyA = `${m.clubA}-${m.equipeA}`;
      const keyB = `${m.clubB}-${m.equipeB}`;
      if (stats[keyA] && stats[keyB]) {
        const sA = Number(m.scoreA) || 0;
        const sB = Number(m.scoreB) || 0;
        
        stats[keyA].m++; stats[keyB].m++;
        stats[keyA].ptsPlus += sA;
        stats[keyA].ptsMoins += sB;
        stats[keyB].ptsPlus += sB;
        stats[keyB].ptsMoins += sA;
        
        if (sA > sB) {
          stats[keyA].v++; stats[keyA].points += 2;
          stats[keyB].d++; stats[keyB].points += 1;
        } else if (sB > sA) {
          stats[keyB].v++; stats[keyB].points += 2;
          stats[keyA].d++; stats[keyA].points += 1;
        }
      }
    });

    return Object.values(stats)
      .map((s: any) => ({ ...s, diff: s.ptsPlus - s.ptsMoins }))
      .sort((a: any, b: any) => b.points - a.points || b.diff - a.diff);
  };

  const classement = calculerClassement();
  const isAdmin = user?.username?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const ajouterEquipeACompete = async () => {
    if (!selectedEquipe || !selectedClubId || !competition) return;
    const club = clubs.find(c => c.id === selectedClubId);
    if (!club) return;

    const nouvelleEntree = {
      equipeId: selectedEquipe.id,
      nom: selectedEquipe.nom,
      clubNom: club.nom,
      logoColor: club.logoColor
    };
    const nouvelles = [...(competition.equipes_engagees || []), nouvelleEntree];
    const { error } = await supabase.from('competitions').update({ equipes_engagees: nouvelles }).eq('id', compId);
    if (!error) {
      setCompetition({ ...competition, equipes_engagees: nouvelles });
      setSelectedEquipe(null);
      setSelectedClubId('');
    }
  };

  const retirerEquipe = async (id: string) => {
    if (!confirm("Retirer cette équipe ?")) return;
    const filtrees = competition.equipes_engagees.filter((e: any) => e.equipeId !== id);
    await supabase.from('competitions').update({ equipes_engagees: filtrees }).eq('id', compId);
    setCompetition({ ...competition, equipes_engagees: filtrees });
  };

  // SECURITÉ ANTI-CRASH
  if (loading || !competition) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', fontWeight: 'bold', color: '#F97316' }}>🏀 Chargement Dunkly...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={heroSection}>
        <button onClick={() => router.push('/competitions')} style={backBtn}>← Retour aux compétitions</button>
        <h1 style={titleStyle}>{competition.nom}</h1>
        <div style={badgeGrid}>
          <div style={miniBadge}>🏆 {competition.type}</div>
          <div style={miniBadge}>📅 Saison 2025/2026</div>
        </div>
      </div>

      <div style={mainGrid}>
        <div style={statsCard}>
          <h2 style={cardTitle}>🏆 Classement Officiel</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={thRow}>
                <th style={thL}>CLUB</th>
                <th style={thC}>M</th>
                <th style={thC}>V</th>
                <th style={thC}>D</th>
                <th style={thC}>DIFF</th>
                <th style={thC}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((team: any, index: number) => (
                <tr key={index} style={trStyle}>
                  <td style={tdL}>
                    <span style={rankStyle(index)}>{index + 1}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '800' }}>{team.nom}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{team.clubNom}</span>
                    </div>
                  </td>
                  <td style={tdC}>{team.m}</td>
                  <td style={{ ...tdC, color: '#22c55e', fontWeight: 'bold' }}>{team.v}</td>
                  <td style={{ ...tdC, color: '#ef4444' }}>{team.d}</td>
                  <td style={{ ...tdC, fontWeight: 'bold', color: team.diff >= 0 ? '#22c55e' : '#ef4444' }}>
                    {team.diff > 0 ? `+${team.diff}` : team.diff}
                  </td>
                  <td style={{ ...tdC, fontWeight: '900', color: '#F97316' }}>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {classement.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Aucune équipe engagée.</p>}
        </div>

        <div style={actionColumn}>
          {isAdmin && (
            <div style={adminCard}>
              <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Engager une équipe</h3>
              <select style={selectStyle} value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)}>
                <option value="">-- Club --</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select style={{ ...selectStyle, marginTop: '10px' }} disabled={!selectedClubId} onChange={(e) => setSelectedEquipe(e.target.value ? JSON.parse(e.target.value) : null)}>
                <option value="">-- Équipe --</option>
                {clubs.find(c => c.id === selectedClubId)?.equipes?.map((eq: any) => (
                  <option key={eq.id} value={JSON.stringify(eq)}>{eq.nom}</option>
                ))}
              </select>
              <button onClick={ajouterEquipeACompete} disabled={!selectedEquipe} style={addBtn}>Ajouter l'équipe</button>
            </div>
          )}

          <div style={infoBox}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Inscriptions ({competition.equipes_engagees?.length || 0})</h3>
            {competition.equipes_engagees?.map((eq: any) => (
                <div key={eq.equipeId} style={equipeSmallTag}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: eq.logoColor }}></div>
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>{eq.nom}</span>
                  {isAdmin && <button onClick={() => retirerEquipe(eq.equipeId)} style={miniRemoveBtn}>×</button>}
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES (Conservés selon ton design)
const containerStyle = { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1e293b' };
const heroSection = { textAlign: 'center' as const, marginBottom: '50px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' };
const badgeGrid = { display: 'flex', gap: '10px', justifyContent: 'center' };
const miniBadge = { backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem' };
const backBtn = { background: 'none', border: 'none', color: '#F97316', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' };
const statsCard = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const cardTitle = { fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const };
const thRow = { borderBottom: '2px solid #f1f5f9' };
const thL = { textAlign: 'left' as const, padding: '15px', color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' as const };
const thC = { textAlign: 'center' as const, padding: '15px', color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' as const };
const trStyle = { borderBottom: '1px solid #f8fafc' };
const tdL = { padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' };
const tdC = { padding: '15px', textAlign: 'center' as const, fontSize: '0.95rem' };
const rankStyle = (i: number) => ({ backgroundColor: i === 0 ? '#FEF3C7' : '#f1f5f9', color: i === 0 ? '#92400E' : '#475569', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 });
const actionColumn = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const adminCard = { backgroundColor: '#1e293b', color: 'white', padding: '25px', borderRadius: '24px' };
const infoBox = { backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#334155', color: 'white' };
const addBtn = { width: '100%', marginTop: '15px', padding: '14px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const equipeSmallTag = { display: 'flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '8px' };
const miniRemoveBtn = { background: '#fee2e2', color: '#ef4444', border: 'none', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };