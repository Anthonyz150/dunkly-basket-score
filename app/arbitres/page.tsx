"use client";
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";

export default function ArbitresPage() {
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nom: "", prenom: "" });

  useEffect(() => {
    const data = getFromLocal('arbitres');
    setArbitres(Array.isArray(data) ? data : []);
  }, []);

  const ajouterArbitre = (e: React.FormEvent) => {
    e.preventDefault();
    const data = getFromLocal('arbitres');
    const actuelles = Array.isArray(data) ? data : [];
    
    const nouveau = { 
      id: Date.now().toString(), 
      nom: formData.nom.toUpperCase(), 
      prenom: formData.prenom 
    };
    
    const miseAJour = [...actuelles, nouveau];
    saveToLocal('arbitres', miseAJour);
    setArbitres(miseAJour);
    setFormData({ nom: "", prenom: "" });
  };

  return (
    <div className="dashboard-wrapper">
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '20px' }}>🏁 Arbitres</h1>
      <form onSubmit={ajouterArbitre} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Nom" 
          value={formData.nom} 
          onChange={(e) => setFormData({...formData, nom: e.target.value})} 
          style={inputStyle} required 
        />
        <input 
          type="text" 
          placeholder="Prénom" 
          value={formData.prenom} 
          onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
          style={inputStyle} required 
        />
        <button type="submit" style={btnStyle}>Ajouter</button>
      </form>

      <div className="grid-container">
        {arbitres.map((arb) => (
          <div key={arb.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ backgroundColor: '#1a1a1a', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {arb.nom[0]}
            </div>
            <div>
              <div style={{ fontWeight: '800' }}>{arb.nom} {arb.prenom}</div>
              <div style={{ color: '#666', fontSize: '0.8rem' }}>Officiel Dunkly</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const btnStyle = { backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };