'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DetailClubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clubId = resolvedParams.id;
  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour l'édition
  const [nomEquipe, setNomEquipe] = useState('');
  const [showEditClub, setShowEditClub] = useState(false);
  const [editClubForm, setEditClubForm] = useState({ nom: '', ville: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    chargerClub();
  }, [clubId]);

  const chargerClub = async () => {
    const { data } = await supabase
      .from('equipes_clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (data) {
      setClub(data);
      setEditClubForm({ nom: data.nom, ville: data.ville });
    }
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const handleUpdateClub = async () => {
    const { error } = await supabase
      .from('equipes_clubs')
      .update({ nom: editClubForm.nom, ville: editClubForm.ville })
      .eq('id', clubId);

    if (!error) {
      setClub({ ...club, ...editClubForm });
      setShowEditClub(false);
    }
  };

  const ajouterEquipe = async () => {
    if (!nomEquipe.trim()) return;
    const nouvellesEquipes = [...(club.equipes || []), { id: Date.now().toString(), nom: nomEquipe.trim() }];
    
    const { error } = await supabase
      .from('equipes_clubs')
      .update({ equipes: nouvellesEquipes })
      .eq('id', clubId);

    if (!error) {
      setClub({ ...club, equipes: nouvellesEquipes });
      setNomEquipe('');
    }
  };

  const supprimerEquipe = async (eqId: string) => {
    if (!confirm("Supprimer cette équipe ?")) return;
    const filtrées = club.equipes.filter((e: any) => e.id !== eqId);
    const { error } = await supabase
      .from('equipes_clubs')
      .update({ equipes: filtrées })
      .eq('id', clubId);

    if (!error) setClub({ ...club, equipes: filtrées });
  };

  if (loading) return <div style={containerStyle}>🏀 Chargement...</div>;
  if (!club) return <div style={containerStyle}>Club introuvable.</div>;

  return (
    <div style={containerStyle}>
      <button onClick={() => router.push('/equipes')} style={backBtn}>← Retour aux clubs</button>

      {/* HEADER DU CLUB */}
      <div style={headerCard}>
        <div style={{ ...logoStyle, backgroundColor: club.logoColor }}>{club.nom[0]}</div>
        <div style={{ flex: 1 }}>
          {showEditClub ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                style={miniInput} 
                value={editClubForm.nom} 
                onChange={e => setEditClubForm({...editClubForm, nom: e.target.value})} 
              />
              <input 
                style={miniInput} 
                value={editClubForm.ville} 
                onChange={e => setEditClubForm({...editClubForm, ville: e.target.value})} 
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handleUpdateClub} style={saveSmallBtn}>OK</button>
                <button onClick={() => setShowEditClub(false)} style={cancelSmallBtn}>Annuler</button>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {club.nom} 
                {isAdmin && <button onClick={() => setShowEditClub(true)} style={editToggleBtn}>✏️</button>}
              </h1>
              <p style={{ color: '#64748b', margin: 0 }}>📍 {club.ville}</p>
            </>
          )}
        </div>
      </div>

      {/* AJOUT ÉQUIPE */}
      {isAdmin && (
        <div style={addBox}>
          <input 
            placeholder="Nom de l'équipe (ex: U15M, Seniors F...)" 
            value={nomEquipe} 
            onChange={(e) => setNomEquipe(e.target.value)}
            style={inputStyle}
          />
          <button onClick={ajouterEquipe} style={addBtn}>+ Ajouter</button>
        </div>
      )}

      {/* LISTE */}
      <div style={listContainer}>
        <h2 style={sectionTitle}>Catégories / Équipes ({club.equipes?.length || 0})</h2>
        {club.equipes && club.equipes.length > 0 ? (
          club.equipes.map((eq: any) => (
            <div key={eq.id} style={equipeItem}>
              <span style={{ fontWeight: 'bold' }}>🏀 {eq.nom}</span>
              {isAdmin && (
                <button onClick={() => supprimerEquipe(eq.id)} style={deleteBtn}>Supprimer</button>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Aucune équipe.</p>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' };
const backBtn = { background: '#f1f5f9', border: 'none', color: '#475569', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' };
const headerCard = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const logoStyle = { width: '80px', height: '80px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' };
const editToggleBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' };
const miniInput = { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' };
const saveSmallBtn = { background: '#22c55e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const cancelSmallBtn = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const addBox = { display: 'flex', gap: '10px', marginBottom: '30px' };
const inputStyle = { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem' };
const addBtn = { padding: '12px 20px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const listContainer = { backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const sectionTitle = { fontSize: '0.9rem', padding: '15px 20px', margin: 0, borderBottom: '1px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '1px' };
const equipeItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f8fafc' };
const deleteBtn = { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' };