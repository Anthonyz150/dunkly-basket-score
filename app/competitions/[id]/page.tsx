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

      setCompetition(comp);
      setClubs(listeClubs || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

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

            {/* 2. Choisir l'Équipe (Valeur contrôlée pour éviter le blocage) */}
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

// --- STYLES (S'ASSURER DU "as const" POUR TYPESCRIPT) ---
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