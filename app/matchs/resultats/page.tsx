"use client";
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // FIX: On vérifie explicitement si c'est un tableau
    const dataRaw = getFromLocal('resultats');
    const data = Array.isArray(dataRaw) ? dataRaw : [];
    setMatchs(data);
  }, []);

  // Fonction pour vider l'historique
  const purgerResultats = () => {
    if(confirm("Voulez-vous vraiment effacer tous les résultats ?")) {
      saveToLocal('resultats', []);
      setMatchs([]);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="header-title-row">
        <div>
          <h1>✅ Résultats</h1>
          <p className="welcome-text">Historique des rencontres terminées.</p>
        </div>
        {matchs.length > 0 && (
          <button 
            onClick={purgerResultats}
            style={{ padding: '8px 15px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Effacer tout
          </button>
        )}
      </div>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        {matchs.length > 0 ? (
          matchs.map((m, index) => (
            <div key={index} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>
                  {m.equipeA} <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs</span> {m.equipeB}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                  {m.competition} • Terminé le {m.dateFin ? new Date(m.dateFin).toLocaleDateString() : (m.date || "Date inconnue")}
                </span>
              </div>
              
              <div style={{ 
                background: '#1e293b', 
                color: '#F97316', 
                padding: '12px 25px', 
                borderRadius: '12px', 
                fontWeight: '900',
                fontSize: '1.5rem',
                minWidth: '120px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                fontFamily: 'monospace'
              }}>
                {m.scoreA} - {m.scoreB}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>📁</span>
            <p>Aucun résultat enregistré dans l'historique.</p>
          </div>
        )}
      </div>
    </div>
  );
}