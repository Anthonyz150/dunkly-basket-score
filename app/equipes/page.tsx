'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EquipeIntern {
  id: string;
  nom: string;
}

interface Club {
  id: string;
  nom: string;
  ville: string;
  logoColor: string;
  equipes: EquipeIntern[];
}

export default function EquipesPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showClubModal, setShowClubModal] = useState(false);
  const [showEquipeModal, setShowEquipeModal] = useState(false);

  const [nomClub, setNomClub] = useState('');
  const [ville, setVille] = useState('');
  const [nomEquipe, setNomEquipe] = useState('');
  const [targetClubId, setTargetClubId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    chargerClubs();
  }, []);

  const chargerClubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipes_clubs')
      .select('*')
      .order('nom');
    
    if (!error && data) {
      // On s'assure que 'equipes' est toujours un tableau
      const formattedData = data.map(c => ({
        ...c,
        equipes: Array.isArray(c.equipes) ? c.equipes : []
      }));
      setClubs(formattedData);
    }
    setLoading(false);
  };

  // Sécurité admin élargie
  const isAdmin = user?.role === 'admin' || user?.username?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const handleCreateClub = async () => {
    if (!nomClub || !ville) return alert("Nom et ville requis !");
    
    const nouveauClub = {
      nom: nomClub.trim(),
      ville: ville.trim(),
      logoColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      equipes: [] // Initialisé vide
    };

    const { data, error } = await supabase
      .from('equipes_clubs')
      .insert([nouveauClub])
      .select();

    if (!error && data) {
      setClubs([...clubs, { ...data[0], equipes: [] }]);
      setNomClub(''); setVille(''); setShowClubModal(false);
    } else {
      alert("Erreur lors de la création du club");
    }
  };

  const handleCreateEquipe = async () => {
    if (!nomEquipe || !targetClubId) return alert("Nom d'équipe et Club requis !");
    
    const clubActuel = clubs.find(c => c.id === targetClubId);
    if (!clubActuel) return;

    const nouvellesEquipes = [
      ...(clubActuel.equipes || []), 
      { id: Date.now().toString(), nom: nomEquipe.trim() }
    ];

    const { error } = await supabase
      .from('equipes_clubs')
      .update({ equipes: nouvellesEquipes })
      .eq('id', targetClubId);

    if (!error) {
      setClubs(clubs.map(c => c.id === targetClubId ? { ...c, equipes: nouvellesEquipes } : c));
      setNomEquipe(''); setTargetClubId(''); setShowEquipeModal(false);
    } else {
      alert("Erreur lors de l'ajout de l'équipe");
    }
  };

  if (loading) return <div style={{ padding: '30px', color: '#64748b' }}>🏀 Chargement des clubs...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>🛡️ CLUBS & ÉQUIPES</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Gérez vos structures et leurs catégories.</p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowClubModal(true)} style={btnClubStyle}>+ CLUB</button>
            <button onClick={() => setShowEquipeModal(true)} style={btnEquipeStyle}>+ ÉQUIPE</button>
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {clubs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun club enregistré pour le moment.</p>
        ) : (
          clubs.map((club) => (
            <div key={club.id} style={cardStyle}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ ...logoStyle, backgroundColor: club.logoColor }}>{club.nom[0]}</div>
                   <div style={{ overflow: 'hidden' }}>
                      <h3 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.nom}</h3>
                      <small style={{ color: '#64748b' }}>📍 {club.ville}</small>
                   </div>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {club.equipes && club.equipes.length > 0 ? (
                    club.equipes.map(eq => (
                      <span key={eq.id} style={tagStyle}>🏀 {eq.nom}</span>
                    ))
                  ) : (
                    <small style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucune équipe</small>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALE CLUB */}
      {showClubModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Nouveau Club</h3>
            <input placeholder="Nom du club" value={nomClub} onChange={(e) => setNomClub(e.target.value)} style={inputStyle} />
            <input placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleCreateClub} style={btnConfirm}>Enregistrer</button>
              <button onClick={() => setShowClubModal(false)} style={btnCancel}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ÉQUIPE */}
      {showEquipeModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Ajouter une Équipe</h3>
            <select value={targetClubId} onChange={(e) => setTargetClubId(e.target.value)} style={inputStyle}>
              <option value="">Choisir un club...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <input placeholder="Ex: U15M1 ou Seniors F" value={nomEquipe} onChange={(e) => setNomEquipe(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleCreateEquipe} style={btnConfirm}>Ajouter</button>
              <button onClick={() => setShowEquipeModal(false)} style={btnCancel}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const btnClubStyle = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '0.85rem' };
const btnEquipeStyle = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '0.85rem' };
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalStyle: React.CSSProperties = { background: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' };
const btnConfirm = { flex: 1, padding: '12px', background: '#F97316', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancel = { flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const cardStyle = { backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s' };
const logoStyle = { minWidth: '45px', height: '45px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' as const, fontSize: '1.2rem' };
const tagStyle = { backgroundColor: '#f8fafc', color: '#334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #e2e8f0' };