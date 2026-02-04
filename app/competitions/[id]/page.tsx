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
    // 1. Charger la compétition
    const { data: comp } = await supabase.from('competitions').select('*').eq('id', compId).single();
    
    // 2. Charger tous les clubs pour le sélecteur
    const { data: listeClubs } = await supabase.from('equipes_clubs').select('*').order('nom');

    if (comp) setCompetition(comp);
    if (listeClubs) setClubs(listeClubs);
    setLoading(false);
  };

  const isAdmin = user?.username?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const ajouterEquipeACompete = async () => {
    if (!selectedEquipe) return;

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
    }
  };

  const retirerEquipe = async (equipeId: string) => {
    const filtrées = competition.equipes_engagees.filter((e: any) => e.equipeId !== equipeId);
    const { error } = await supabase.from('competitions').update({ equipes_engagees: filtrées }).eq('id', compId);
    if (!error) setCompetition({ ...competition, equipes_engagees: filtrées });
  };

  if (loading) return <div style={containerStyle}>Chargement...</div>;

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
          <h3 style={{ marginTop: 0, fontSize: '0.9rem', color: '#1e293b' }}>Engager une équipe</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Choisir le Club */}
            <select 
              style={selectStyle} 
              value={selectedClubId} 
              onChange={(e) => { setSelectedClubId(e.target.value); setSelectedEquipe(null); }}
            >
              <option value="">Sélectionner un club...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>

            {/* Choisir l'Équipe du club */}
            <select 
              style={selectStyle} 
              disabled={!selectedClubId}
              onChange={(e) => setSelectedEquipe(JSON.parse(e.target.value))}
            >
              <option value="">Choisir l'équipe...</option>
              {clubSelectionne?.equipes?.map((eq: any) => (
                <option key={eq.id} value={JSON.stringify(eq)}>{eq.nom}</option>
              ))}
            </select>

            <button onClick={ajouterEquipeACompete} style={addBtn} disabled={!selectedEquipe}>
              Engager
            </button>
          </div>
        </div>
      )}

      {/* LISTE DES ÉQUIPES ENGAGÉES */}
      <div style={listContainer}>
        <h2 style={sectionTitle}>Équipes engagées ({competition.equipes_engagees?.length || 0})</h2>
        <div style={equipesGrid}>
          {competition.equipes_engagees?.length > 0 ? (
            competition.equipes_engagees.map((eq: any) => (
              <div key={eq.equipeId} style={equipeTag}>
                <div style={{ ...miniLogo, backgroundColor: eq.logoColor }}>{eq.clubNom[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{eq.nom}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{eq.clubNom}</div>
                </div>
                {isAdmin && <button onClick={() => retirerEquipe(eq.equipeId)} style={removeBtn}>×</button>}
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
              Aucune équipe pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' };
const backBtn = { background: '#f1f5f9', border: 'none', color: '#64748b', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' as const, marginBottom: '20px' };
const headerCard = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const iconStyle = { fontSize: '2.5rem', background: '#fff7ed', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px' };

const addBox = { background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '30px' };
const selectStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1, minWidth: '150px' };
const addBtn = { padding: '10px 20px', background: '#F97316', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' as const, cursor: 'pointer' };

const listContainer = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px' };
const sectionTitle = { fontSize: '1rem', margin: '0 0 20px 0', color: '#1e293b' };
const equipesGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' };
const equipeTag = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f1f5f9', borderRadius: '12px', position: 'relative' as const };
const miniLogo = { width: '30px', height: '30px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' as const };
const removeBtn = { background: '#ef4444', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' };