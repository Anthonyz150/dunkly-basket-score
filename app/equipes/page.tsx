'use client';
import { useState, useEffect } from 'react';
import { saveToLocal, getFromLocal } from '@/lib/store';

interface Equipe {
  id: string;
  nom: string;
  ville: string;
  logoColor: string;
}

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setEquipes(getFromLocal('equipes') || []);
  }, []);

  // PROTECTION : Seul 'admin' a les droits désormais
  const isAdmin = user?.username === 'admin';

  const ajouterEquipe = () => {
    if (!isAdmin) return; // Sécurité côté fonction
    if (!nom || !ville) return alert("Remplis le nom et la ville !");
    
    const nouvelle: Equipe = {
      id: Date.now().toString(),
      nom,
      ville,
      logoColor: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    const nouvelleListe = [...equipes, nouvelle];
    setEquipes(nouvelleListe);
    saveToLocal('equipes', nouvelleListe);
    
    setNom('');
    setVille('');
    setIsModalOpen(false);
  };

  const supprimerEquipe = (id: string) => {
    if (!isAdmin) return; // Sécurité côté fonction
    if (confirm("Supprimer cette équipe ?")) {
      const nouvelleListe = equipes.filter(e => e.id !== id);
      setEquipes(nouvelleListe);
      saveToLocal('equipes', nouvelleListe);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Gestion des Équipes</h1>
        </div>
        
        {/* Le bouton d'ajout ne s'affiche plus pour Anthony */}
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} style={btnAjouterStyle}>
            + Ajouter une Équipe
          </button>
        )}
      </header>

      {/* MODALE sécurisée */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalContentStyle}>
            <h2 style={{ marginTop: 0, color: '#1a1a1a' }}>Nouveau Club</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input 
                placeholder="Nom du club" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)}
                style={inputStyle}
              />
              <input 
                placeholder="Ville" 
                value={ville} 
                onChange={(e) => setVille(e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={ajouterEquipe} style={{ ...actionBtnStyle, background: 'var(--orange-basket)', flex: 1 }}>Enregistrer</button>
                <button onClick={() => setIsModalOpen(false)} style={{ ...actionBtnStyle, background: '#666', flex: 1 }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {equipes.length > 0 ? equipes.map((e) => (
          <div key={e.id} className="card" style={{ textAlign: 'center', position: 'relative', paddingTop: '30px' }}>
            
            {/* La croix de suppression ne s'affiche plus pour Anthony */}
            {isAdmin && (
              <button onClick={() => supprimerEquipe(e.id)} style={deleteBtnStyle}>×</button>
            )}
            
            <div style={{ 
              width: '70px', height: '70px', borderRadius: '50%', backgroundColor: e.logoColor, 
              margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '1.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {e.nom.charAt(0).toUpperCase()}
            </div>

            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{e.nom}</h3>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>📍 {e.ville}</p>
          </div>
        )) : (
          <p style={{ color: '#999' }}>Aucune équipe enregistrée.</p>
        )}
      </div>
    </div>
  );
}

// STYLES
const btnAjouterStyle = { background: '#1a1a1a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '30px', borderRadius: '15px', width: '350px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' };
const actionBtnStyle = { color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle: React.CSSProperties = { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1' };