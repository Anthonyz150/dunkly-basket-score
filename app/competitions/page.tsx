'use client';
import { useState, useEffect } from 'react';
import { saveToLocal, getFromLocal } from '@/lib/store';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [type, setType] = useState('Championnat');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Récupération de l'utilisateur
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // FIX BUILD : Sécurisation du chargement initial
    const data = getFromLocal('competitions');
    setCompetitions(Array.isArray(data) ? data : []);
  }, []);

  // PROTECTION : Seul 'admin' est considéré comme administrateur
  const isAdmin = user?.username === 'admin';

  const creerCompet = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nom || !isAdmin) return;
    
    const nouvelle = {
      id: Math.random().toString(36).substring(2, 9),
      nom: nom.trim(),
      type,
      dateDebut: new Date().toLocaleDateString('fr-FR'),
    };
    
    const liste = [...competitions, nouvelle];
    setCompetitions(liste);
    saveToLocal('competitions', liste);
    setNom('');
    setIsModalOpen(false);
  };

  const supprimerCompet = (id: string) => {
    if (!isAdmin) return;
    
    if (confirm("Voulez-vous vraiment supprimer ce championnat ?")) {
      const nouvelleListe = competitions.filter(c => c.id !== id);
      setCompetitions(nouvelleListe);
      saveToLocal('competitions', nouvelleListe);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      {/* HEADER PREMIUM */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>🏆 COMPÉTITIONS</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '5px' }}>
            {isAdmin ? "Configurez vos tournois et championnats." : "Liste des épreuves officielles."}
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            style={btnNouveauStyle}
          >
            + NOUVELLE COMPÉTITION
          </button>
        )}
      </header>

      {/* MODALE ADMIN MODERNE */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginTop: 0, fontWeight: '800', color: '#1e293b' }}>Créer un tournoi</h2>
            <form onSubmit={creerCompet} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              
              <div style={inputGroup}>
                <label style={labelStyle}>Nom de la compétition</label>
                <input 
                  placeholder="ex: Coupe de Printemps" 
                  value={nom} 
                  onChange={(e) => setNom(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Format de jeu</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                  <option value="Championnat">Championnat</option>
                  <option value="Tournoi">Tournoi</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Amical">Match Amical</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" style={confirmBtnStyle}>Créer l'épreuve</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRILLE DES COMPÉTITIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {competitions.length > 0 ? competitions.map((c) => (
          <div key={c.id} style={compCardStyle}>
            <div style={decorBar}></div>
            
            <div style={{ padding: '25px', flex: 1, position: 'relative' }}>
              {isAdmin && (
                <button 
                  onClick={() => supprimerCompet(c.id)}
                  style={deleteBtnStyle}
                >
                  ×
                </button>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={typeBadgeStyle(c.type)}>{c.type}</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>{c.nom}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: '600' }}>
                  📅 Lancé le {c.dateDebut}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div style={emptyStateStyle}>
            <span style={{ fontSize: '3rem' }}>🏆</span>
            <p style={{ fontWeight: '600', marginTop: '10px' }}>Aucune compétition active.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- LOGIQUE DE STYLE ---
const typeBadgeStyle = (type: string) => ({
  display: 'inline-block',
  width: 'fit-content',
  padding: '4px 12px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: '800' as const,
  textTransform: 'uppercase' as const,
  backgroundColor: type === 'Championnat' ? '#eff6ff' : type === 'Coupe' ? '#fff7ed' : '#f0fdf4',
  color: type === 'Championnat' ? '#2563eb' : type === 'Coupe' ? '#ea580c' : '#16a34a',
});

// --- STYLES OBJETS ---
const btnNouveauStyle = { backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.05em' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '40px', borderRadius: '24px', width: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' as const };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1rem' };
const confirmBtnStyle = { flex: 2, backgroundColor: '#F97316', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const compCardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const decorBar = { width: '8px', backgroundColor: '#1e293b' };
const deleteBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' };
const emptyStateStyle: React.CSSProperties = { gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' };