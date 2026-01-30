'use client';
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";

export default function ArbitresPage() {
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nom, setNom] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Récupérer l'utilisateur pour les droits
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Charger les arbitres
    setArbitres(getFromLocal('arbitres') || []);
  }, []);

  // PROTECTION : Seul 'admin' a les droits
  const isAdmin = user?.username === 'admin';

  const ajouterArbitre = () => {
    if (!nom || !isAdmin) return; // Sécurité bloquante
    const newArbitres = [...arbitres, { id: Date.now(), nom }];
    setArbitres(newArbitres);
    saveToLocal('arbitres', newArbitres);
    setNom("");
    setShowModal(false);
  };

  const supprimerArbitre = (id: number) => {
    if (!isAdmin) return;
    if (confirm("Supprimer cet arbitre ?")) {
      const newArbitres = arbitres.filter(a => a.id !== id);
      setArbitres(newArbitres);
      saveToLocal('arbitres', newArbitres);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>🏁</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Gestion des Arbitres</h1>
        </div>
        
        {/* Le bouton d'ajout ne s'affiche plus pour Anthony */}
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="action-btn" 
            style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Ajouter un Arbitre
          </button>
        )}
      </div>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {arbitres.length > 0 ? (
          arbitres.map((a) => (
            <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <span style={{ fontWeight: 'bold' }}>{a.nom}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>Officiel</span>
                {/* Optionnel : Bouton supprimer pour l'admin */}
                {isAdmin && (
                  <button 
                    onClick={() => supprimerArbitre(a.id)}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#666' }}>Aucun arbitre enregistré pour le moment.</p>
        )}
      </div>

      {/* MODAL SÉCURISÉE */}
      {showModal && isAdmin && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="card" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginTop: 0 }}>Nouvel Arbitre</h2>
            <input 
              type="text" 
              placeholder="Nom de l'arbitre" 
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={ajouterArbitre} style={{ flex: 1, background: 'var(--orange-basket)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Enregistrer
              </button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle: any = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px', outline: 'none'
};