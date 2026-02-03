'use client';
import { useState, useEffect } from 'react';
import { saveToLocal, getFromLocal } from '@/lib/store';

export default function ArbitresPage() {
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nom: "", prenom: "" });
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // État pour la modification

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    const data = getFromLocal('arbitres');
    setArbitres(Array.isArray(data) ? data : []);
  }, []);

  const isAdmin = user?.username === 'admin';

  // Ouvre la modale en mode modification
  const preparerEdition = (arb: any) => {
    if (!isAdmin) return;
    setEditingId(arb.id);
    setFormData({ nom: arb.nom, prenom: arb.prenom });
    setIsModalOpen(true);
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    let miseAJour;
    if (editingId) {
      // MODE MODIFICATION
      miseAJour = arbitres.map(arb => 
        arb.id === editingId 
          ? { ...arb, nom: formData.nom.toUpperCase().trim(), prenom: formData.prenom.trim() } 
          : arb
      );
    } else {
      // MODE AJOUT
      const nouveau = { 
        id: Date.now().toString(), 
        nom: formData.nom.toUpperCase().trim(), 
        prenom: formData.prenom.trim() 
      };
      miseAJour = [...arbitres, nouveau];
    }
    
    saveToLocal('arbitres', miseAJour);
    setArbitres(miseAJour);
    fermerModale();
  };

  const fermerModale = () => {
    setFormData({ nom: "", prenom: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const supprimerArbitre = (id: string) => {
    if (!isAdmin) return;
    if (confirm("Supprimer cet officiel de la liste ?")) {
      const nouvelleListe = arbitres.filter(arb => arb.id !== id);
      setArbitres(nouvelleListe);
      saveToLocal('arbitres', nouvelleListe);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>🏁 ARBITRES</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            {isAdmin ? "Gestion du corps arbitral Dunkly." : "Liste des officiels de la compétition."}
          </p>
        </div>
        
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} style={btnAjouterStyle}>
            + AJOUTER UN ARBITRE
          </button>
        )}
      </header>

      {/* MODALE */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginTop: 0, fontWeight: '800' }}>
              {editingId ? "Modifier l'Officiel" : "Nouvel Officiel"}
            </h2>
            <form onSubmit={handleSoumettre} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={inputGroup}>
                <label style={labelStyle}>Nom</label>
                <input 
                  placeholder="NOM" 
                  value={formData.nom} 
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  style={inputStyle} required
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Prénom</label>
                <input 
                  placeholder="Prénom" 
                  value={formData.prenom} 
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  style={inputStyle} required
                />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" style={confirmBtnStyle}>
                  {editingId ? "Mettre à jour" : "Enregistrer"}
                </button>
                <button type="button" onClick={fermerModale} style={cancelBtnStyle}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRILLE DES CARTES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {arbitres.map((arb) => (
          <div key={arb.id} style={cardStyle}>
            <div style={decorBar}></div>
            <div style={{ padding: '20px', flex: 1, position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              {isAdmin && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                   {/* BOUTON MODIFIER */}
                  <button onClick={() => preparerEdition(arb)} style={editIconStyle}>✏️</button>
                  <button onClick={() => supprimerArbitre(arb.id)} style={deleteBtnStyle}>×</button>
                </div>
              )}

              <div style={avatarStyle}>
                {(arb.nom || "").charAt(0)}{(arb.prenom || "").charAt(0)}
              </div>
              
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' }}>
                  {arb.nom} {arb.prenom}
                </div>
                <div style={{ color: '#F97316', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  Officiel Dunkly
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- STYLES COMPLÉMENTAIRES ---
const btnAjouterStyle = { backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '40px', borderRadius: '24px', width: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '6px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' as const };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '2px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc' };
const confirmBtnStyle = { flex: 2, backgroundColor: '#F97316', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const decorBar = { width: '6px', backgroundColor: '#1a1a1a' };
const avatarStyle = { width: '45px', height: '45px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' };

// Nouveaux styles pour les boutons d'action
const deleteBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' };
const editIconStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', filter: 'grayscale(1)' };