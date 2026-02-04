'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DetailCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const compId = resolvedParams.id;
  const router = useRouter();

  const [competition, setCompetition] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // AJOUT : État pour les matchs terminés afin de calculer le classement
  const [matchsTermines, setMatchsTermines] = useState<any[]>([]);

  // États pour la sélection
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    chargerDonnees();
  }, [compId]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      // 1. Charger la compétition
      const { data: comp, error: err1 } = await supabase.from('competitions').select('*').eq('id', compId).single();
      if (err1) throw err1;

      // 2. Charger tous les clubs
      const { data: listeClubs, error: err2 } = await supabase.from('equipes_clubs').select('*').order('nom');
      if (err2) throw err2;

      // AJOUT : 3. Charger les matchs terminés de cette compétition
      const { data: matchs, error: err3 } = await supabase
        .from('matchs')
        .select('*')
        .eq('competition', comp.nom)
        .eq('status', 'termine');
      if (err3) throw err3;

      setCompetition(comp);
      setClubs(listeClubs || []);
      setMatchsTermines(matchs || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // AJOUT : LOGIQUE DE CALCUL DU CLASSEMENT
  const calculerClassement = () => {
    const stats: Record<string, any> = {};

    // Initialiser avec les équipes engagées
    competition?.equipes_engagees?.forEach((eq: any) => {
      const key = `${eq.clubNom}-${eq.nom}`;
      stats[key] = { ...eq, joues: 0, v: 0, d: 0, ptsPlus: 0, ptsMoins: 0, points: 0 };
    });

    // Traiter les matchs
    matchsTermines.forEach(m => {
      const keyA = `${m.clubA}-${m.equipeA}`;
      const keyB = `${m.clubB}-${m.equipeB}`;

      if (stats[keyA] && stats[keyB]) {
        stats[keyA].joues++;
        stats[keyB].joues++;
        stats[keyA].ptsPlus += (m.scoreA || 0);
        stats[keyA].ptsMoins += (m.scoreB || 0);
        stats[keyB].ptsPlus += (m.scoreB || 0);
        stats[keyB].ptsMoins += (m.scoreA || 0);

        if (m.scoreA > m.scoreB) {
          stats[keyA].v++; stats[keyA].points += 2;
          stats[keyB].d++; stats[keyB].points += 1;
        } else if (m.scoreB > m.scoreA) {
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
    if (!selectedEquipe || !selectedClubId) return;

    // Vérifier si déjà présente
    const dejaPresente = competition.equipes_engagees?.some((e: any) => e.equipeId === selectedEquipe.id);
    if (dejaPresente) return alert("Cette équipe est déjà inscrite !");

    const clubParent = clubs.find(c => c.id === selectedClubId);
    const nouvelleEntree = {
      equipeId: selectedEquipe.id,
      nom: selectedEquipe.nom,
      clubNom: clubParent.nom,
      logoColor: clubParent.logoColor
    };

    const nouvellesEquipes = [...(competition.equipes_engagees || []), nouvelleEntree];

    const { error } = await supabase
      .from('competitions')
      .update({ equipes_engagees: nouvellesEquipes })
      .eq('id', compId);

    if (!error) {
      setCompetition({ ...competition, equipes_engagees: nouvellesEquipes });
      setSelectedEquipe(null);
      setSelectedClubId(''); // Reset après succès
    } else {
      alert("Erreur base de données : " + error.message);
    }
  };

  const retirerEquipe = async (equipeId: string) => {
    if (!confirm("Retirer cette équipe ?")) return;
    const filtrées = competition.equipes_engagees.filter((e: any) => e.equipeId !== equipeId);
    const { error } = await supabase.from('competitions').update({ equipes_engagees: filtrées }).eq('id', compId);
    if (!error) setCompetition({ ...competition, equipes_engagees: filtrées });
  };

  if (loading) return <div style={containerStyle}>🏀 Chargement des données...</div>;
  if (!competition) return <div style={containerStyle}>Compétition introuvable.</div>;

  const clubSelectionne = clubs.find(c => c.id === selectedClubId);

  return (
    <div style={containerStyle}>
      <button onClick={() => router.push('/competitions')} style={backBtn}>← Retour</button>

      <div style={headerCard}>
        <div style={iconStyle}>🏆</div>
        <div>
          <h1 style={{ margin: 0 }}>{competition.nom}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{competition.type} • Saison 2025/2026</p>
        </div>
      </div>

      {/* AJOUT : TABLEAU DU CHAMPIONNAT */}
      <div style={{ ...listContainer, marginBottom: '30px' }}>
        <h2 style={sectionTitle}>Classement Général</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={thrStyle}>
                <th style={thStyle}>Pos</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Équipe</th>
                <th style={thStyle}>J</th>
                <th style={thStyle}>V</th>
                <th style={thStyle}>D</th>
                <th style={thStyle}>+/-</th>
                <th style={thStyle}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((row: any, idx: number) => (
                <tr key={idx} style={trStyle}>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ ...miniLogo, width: '25px', height: '25px', fontSize: '0.7rem', backgroundColor: row.logoColor }}>{row.clubNom ? row.clubNom[0] : '?'}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{row.nom}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{row.clubNom}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{row.joues}</td>
                  <td style={tdStyle}>{row.v}</td>
                  <td style={tdStyle}>{row.d}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: row.diff >= 0 ? '#10b981' : '#ef4444' }}>{row.diff > 0 ? `+${row.diff}` : row.diff}</td>
                  <td style={{ ...tdStyle, fontWeight: '900', color: '#F97316' }}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION ENGAGEMENT DES ÉQUIPES */}
      {isAdmin && (
        <div style={addBox}>
          <h3 style={{ marginTop: 0, fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase' }}>Engager une équipe</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* 1. Choisir le Club */}
            <select 
              style={selectStyle} 
              value={selectedClubId} 
              onChange={(e) => { 
                setSelectedClubId(e.target.value); 
                setSelectedEquipe(null); 
              }}
            >
              <option value="">-- Sélectionner un club --</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>

            {/* 2. Choisir l'Équipe */}
            <select 
              style={selectStyle} 
              disabled={!selectedClubId}
              value={selectedEquipe ? JSON.stringify(selectedEquipe) : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSelectedEquipe(JSON.parse(val));
                } else {
                  setSelectedEquipe(null);
                }
              }}
            >
              <option value="">-- Choisir l'équipe --</option>
              {clubSelectionne?.equipes?.map((eq: any) => (
                <option key={eq.id} value={JSON.stringify(eq)}>{eq.nom}</option>
              ))}
            </select>

            <button 
              onClick={ajouterEquipeACompete} 
              style={{
                ...addBtn,
                opacity: selectedEquipe ? 1 : 0.5,
                cursor: selectedEquipe ? 'pointer' : 'not-allowed'
              }} 
              disabled={!selectedEquipe}
            >
              Engager
            </button>
          </div>
        </div>
      )}

      {/* LISTE DES ÉQUIPES ENGAGÉES */}
      <div style={listContainer}>
        <h2 style={sectionTitle}>Équipes engagées ({competition.equipes_engagees?.length || 0})</h2>
        <div style={equipesGrid}>
          {competition.equipes_engagees && competition.equipes_engagees.length > 0 ? (
            competition.equipes_engagees.map((eq: any) => (
              <div key={eq.equipeId} style={equipeTag}>
                <div style={{ ...miniLogo, backgroundColor: eq.logoColor || '#cbd5e1' }}>
                  {eq.clubNom ? eq.clubNom[0] : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{eq.nom}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{eq.clubNom}</div>
                </div>
                {isAdmin && <button onClick={() => retirerEquipe(eq.equipeId)} style={removeBtn}>×</button>}
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
              Aucune équipe engagée pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, marginTop: '10px' };
const thrStyle = { borderBottom: '2px solid #f1f5f9' };
const thStyle = { padding: '12px 8px', textAlign: 'center' as const, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' as const };
const trStyle = { borderBottom: '1px solid #f8fafc' };
const tdStyle = { padding: '12px 8px', textAlign: 'center' as const, fontSize: '0.9rem' };

const containerStyle = { padding: '40px 20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' };
const backBtn = { background: '#f1f5f9', border: 'none', color: '#64748b', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' as const, marginBottom: '20px' };
const headerCard = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #e2e8f0' };
const iconStyle = { fontSize: '2.5rem', background: '#fff7ed', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid #ffedd5' };

const addBox = { background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '30px' };
const selectStyle = { padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', flex: 1, minWidth: '200px', backgroundColor: 'white' };
const addBtn = { padding: '12px 25px', background: '#F97316', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' as const, transition: 'all 0.2s' };

const listContainer = { background: 'white', borderRadius: '25px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const sectionTitle = { fontSize: '0.9rem', margin: '0 0 20px 0', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const equipesGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' };
const equipeTag = { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' as const };
const miniLogo = { width: '35px', height: '35px', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' as const };
const removeBtn = { position: 'absolute' as const, top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };