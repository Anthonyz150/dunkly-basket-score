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
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setCompetitions(getFromLocal('competitions') || []);
  }, []);

  // CHANGEMENT : Seul 'admin' est considéré comme administrateur
  const isAdmin = user?.username === 'admin';

  const creerCompet = () => {
    // Sécurité supplémentaire : on vérifie isAdmin ici aussi
    if (!nom || !isAdmin) return;
    
    const nouvelle = {
      id: Math.random().toString(36),
      nom,
      type,
      dateDebut: new Date().toLocaleDateString(),
    };
    
    const liste = [...competitions, nouvelle];
    setCompetitions(liste);
    saveToLocal('competitions', liste);
    setNom('');
    setIsModalOpen(false);
  };

  const supprimerCompet = (id: string) => {
    // Sécurité : Anthony ne pourra plus déclencher cette fonction
    if (!isAdmin) return;
    
    if (confirm("Voulez-vous vraiment supprimer ce championnat ?")) {
      const nouvelleListe = competitions.filter(c => c.id !== id);
      setCompetitions(nouvelleListe);
      saveToLocal('competitions', nouvelleListe);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>🏆</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Compétitions</h1>
        </div>

        {/* Le bouton Nouveau n'apparaît que pour 'admin' */}
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Nouvelle Compétition
          </button>
        )}
      </header>

      {/* MODALE sécurisée */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalContentStyle}>
            <h2 style={{ marginTop: 0 }}>Créer un nouveau tournoi</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                placeholder="Nom du tournoi" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)}
                style={inputStyle}
              />
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                <option value="Championnat">Championnat</option>
                <option value="Tournoi">Tournoi</option>
                <option value="Coupe">Coupe</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={creerCompet} style={{ ...btnStyle, background: 'var(--orange-basket)', flex: 1 }}>Enregistrer</button>
                <button onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: '#666', flex: 1 }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {competitions.length > 0 ? competitions.map((c) => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            
            {/* Le bouton '×' n'apparaît que pour 'admin' */}
            {isAdmin && (
              <button 
                onClick={() => supprimerCompet(c.id)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'none', border: 'none', color: '#ff4444',
                  fontSize: '1.2rem', cursor: 'pointer'
                }}
              >
                ×
              </button>
            )}

            <h3 style={{ margin: '0 0 10px 0', color: 'var(--orange-basket)' }}>{c.nom}</h3>
            <p style={{ margin: '5px 0' }}><strong>Format:</strong> {c.type}</p>
            <p style={{ fontSize: '0.8rem', color: '#999' }}>Créé le {c.dateDebut}</p>
          </div>
        )) : (
            <p style={{ color: '#999' }}>Aucune compétition enregistrée.</p>
        )}
      </div>
    </div>
  );
}

// STYLES
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '30px', borderRadius: '15px', width: '400px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' };
const btnStyle = { color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };