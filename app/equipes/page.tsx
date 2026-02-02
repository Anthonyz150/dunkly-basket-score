'use client';
import { useState, useEffect } from 'react';
import { saveToLocal, getFromLocal } from '@/lib/store';

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
  
  // États pour les fenêtres (Modales)
  const [showClubModal, setShowClubModal] = useState(false);
  const [showEquipeModal, setShowEquipeModal] = useState(false);

  // États formulaires
  const [nomClub, setNomClub] = useState('');
  const [ville, setVille] = useState('');
  const [nomEquipe, setNomEquipe] = useState('');
  const [targetClubId, setTargetClubId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    const data = getFromLocal('equipes_clubs');
    setClubs(Array.isArray(data) ? data : []);
  }, []);

  const isAdmin = user?.username === 'admin';

  // --- ACTION : CRÉER UN CLUB ---
  const handleCreateClub = () => {
    if (!nomClub || !ville) return alert("Nom et ville requis !");
    const nouveau: Club = {
      id: Date.now().toString(),
      nom: nomClub.trim(),
      ville: ville.trim(),
      logoColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      equipes: []
    };
    const nouvelleListe = [...clubs, nouveau];
    setClubs(nouvelleListe);
    saveToLocal('equipes_clubs', nouvelleListe);
    setNomClub(''); setVille(''); setShowClubModal(false);
  };

  // --- ACTION : CRÉER UNE ÉQUIPE DANS UN CLUB ---
  const handleCreateEquipe = () => {
    if (!nomEquipe || !targetClubId) return alert("Nom d'équipe et Club requis !");
    
    const nouvelleListe = clubs.map(club => {
      if (club.id === targetClubId) {
        return {
          ...club,
          equipes: [...club.equipes, { id: Date.now().toString(), nom: nomEquipe.trim() }]
        };
      }
      return club;
    });

    setClubs(nouvelleListe);
    saveToLocal('equipes_clubs', nouvelleListe);
    setNomEquipe(''); setTargetClubId(''); setShowEquipeModal(false);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>🏀 GESTION</h1>
          <p style={{ color: '#64748b' }}>Créez vos clubs puis ajoutez vos équipes.</p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowClubModal(true)} style={btnClubStyle}>+ CRÉER UN CLUB</button>
            <button onClick={() => setShowEquipeModal(true)} style={btnEquipeStyle}>+ CRÉER UNE ÉQUIPE</button>
          </div>
        )}
      </header>

      {/* AFFICHAGE DES CLUBS ET LEURS ÉQUIPES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {clubs.map((club) => (
          <div key={club.id} style={cardStyle}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ ...logoStyle, backgroundColor: club.logoColor }}>{club.nom[0]}</div>
                 <div>
                    <h3 style={{ margin: 0 }}>{club.nom}</h3>
                    <small style={{ color: '#64748b' }}>📍 {club.ville}</small>
                 </div>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {club.equipes.map(eq => (
                  <span key={eq.id} style={tagStyle}>🏀 {eq.nom}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE : CRÉER UN CLUB */}
      {showClubModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Nouveau Club</h3>
            <input placeholder="Nom du club" value={nomClub} onChange={(e) => setNomClub(e.target.value)} style={inputStyle} />
            <input placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleCreateClub} style={btnConfirm}>Enregistrer</button>
              <button onClick={() => setShowClubModal(false)} style={btnCancel}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : CRÉER UNE ÉQUIPE */}
      {showEquipeModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Nouvelle Équipe</h3>
            <select value={targetClubId} onChange={(e) => setTargetClubId(e.target.value)} style={inputStyle}>
              <option value="">Sélectionner le club...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <input placeholder="Nom de l'équipe (ex: U15)" value={nomEquipe} onChange={(e) => setNomEquipe(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleCreateEquipe} style={btnConfirm}>Ajouter l'équipe</button>
              <button onClick={() => setShowEquipeModal(false)} style={btnCancel}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const btnClubStyle = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnEquipeStyle = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modalStyle: React.CSSProperties = { background: 'white', padding: '30px', borderRadius: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const btnConfirm = { flex: 1, padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancel = { flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const cardStyle = { backgroundColor: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const logoStyle = { width: '45px', height: '45px', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' };
const tagStyle = { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' };