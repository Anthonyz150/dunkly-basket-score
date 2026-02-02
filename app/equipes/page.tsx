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
    // Récupération de l'utilisateur
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // FIX BUILD: Sécurisation du chargement initial
    const data = getFromLocal('equipes');
    setEquipes(Array.isArray(data) ? data : []);
  }, []);

  // PROTECTION : Seul 'admin' a les droits
  const isAdmin = user?.username === 'admin';

  const ajouterEquipe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    if (!nom || !ville) return alert("Remplis le nom et la ville !");
    
    const nouvelle: Equipe = {
      id: Date.now().toString(),
      nom: nom.trim(),
      ville: ville.trim(),
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
    if (!isAdmin) return;
    if (confirm("Supprimer cette équipe ?")) {
      const nouvelleListe = equipes.filter(e => e.id !== id);
      setEquipes(nouvelleListe);
      saveToLocal('equipes', nouvelleListe);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      {/* HEADER MODERNE */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>🏀 ÉQUIPES</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '5px' }}>
            {isAdmin ? "Gestion administrative des clubs." : "Consultez la liste des clubs engagés."}
          </p>
        </div>
        
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} style={btnAjouterStyle}>
            + AJOUTER UN CLUB
          </button>
        )}
      </header>

      {/* MODALE ADMIN */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginTop: 0, fontWeight: '800' }}>Nouveau Club</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={inputGroup}>
                <label style={labelStyle}>Nom du club</label>
                <input 
                  placeholder="ex: Dunkly Warriors" 
                  value={nom} 
                  onChange={(e) => setNom(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Ville</label>
                <input 
                  placeholder="ex: Paris" 
                  value={ville} 
                  onChange={(e) => setVille(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button onClick={ajouterEquipe} style={confirmBtnStyle}>Enregistrer</button>
                <button onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRILLE DES ÉQUIPES VERSION MODERNE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {equipes.length > 0 ? equipes.map((e) => (
          <div key={e.id} style={equipeCardStyle}>
            {/* Barre latérale décorative utilisant la couleur générée */}
            <div style={{ ...decorBar, backgroundColor: e.logoColor }}></div>
            
            <div style={{ padding: '25px', flex: 1, position: 'relative' }}>
              {isAdmin && (
                <button onClick={() => supprimerEquipe(e.id)} style={deleteBtnStyle} title="Supprimer">×</button>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '12px', backgroundColor: e.logoColor, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {e.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>{e.nom}</h3>
                  <span style={cityBadgeStyle}>📍 {e.ville}</span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <span style={{ fontSize: '3rem' }}>📁</span>
            <p style={{ fontWeight: '600', marginTop: '10px' }}>Aucune équipe enregistrée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const btnAjouterStyle = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '40px', borderRadius: '24px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1rem' };
const confirmBtnStyle = { flex: 1, backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const equipeCardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' };
const decorBar = { width: '8px' };
const cityBadgeStyle = { display: 'inline-block', marginTop: '5px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' };
const deleteBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' };