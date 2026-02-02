'use client';
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";

export default function ArbitresPage() {
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nom, setNom] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setArbitres(getFromLocal('arbitres') || []);
  }, []);

  const isAdmin = user?.username === 'admin';

  const ajouterArbitre = () => {
    if (!nom || !isAdmin) return;
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

  if (!isMounted) return null;

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, color: '#1a1a1a' }}>
            🏁 Gestion des Arbitres
          </h1>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Ajouter
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {arbitres.length > 0 ? (
          arbitres.map((a) => (
            <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{a.nom}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#999', background: '#f4f4f4', padding: '4px 8px', borderRadius: '4px' }}>OFFICIEL</span>
                {isAdmin && (
                  <button 
                    onClick={() => supprimerArbitre(a.id)}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
            Aucun arbitre enregistré.
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1a1a1a' }}>Nouvel Arbitre</h2>
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
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
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
  backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
};

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px', outline: 'none', fontSize: '1rem'
};