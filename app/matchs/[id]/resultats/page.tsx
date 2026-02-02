"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);

  useEffect(() => {
    // On récupère et on garde uniquement les matchs terminés
    const allMatchs = getFromLocal('matchs') || [];
    setMatchs(allMatchs.filter((m: any) => m.status === 'termine'));
  }, []);

  if (matchs.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <span style={{ fontSize: '3.5rem' }}>✅</span>
        <h2 style={{ color: '#1E293B', margin: '10px 0 5px 0' }}>Aucun résultat</h2>
        <p style={{ color: '#64748B' }}>Les scores des matchs terminés s'afficheront ici.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontWeight: '800', marginBottom: '30px' }}>Résultats des matchs</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {matchs.map((m) => (
          <div key={m.id} className="card" style={matchCardStyle}>
             <div style={{fontSize: '0.8rem', color: '#F97316', fontWeight: 'bold'}}>{m.competition}</div>
             <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '15px 0'}}>
                <span style={{fontWeight: '700'}}>{m.equipeA}</span>
                <span style={scoreStyle}>{m.scoreA} - {m.scoreB}</span>
                <span style={{fontWeight: '700'}}>{m.equipeB}</span>
             </div>
             <div style={{fontSize: '0.8rem', color: '#94A3B8'}}>📅 Joué le {m.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles partagés
const emptyStateStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '70vh', textAlign: 'center'
};

const matchCardStyle = {
  padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const scoreStyle = {
  backgroundColor: '#1E293B', color: 'white', padding: '5px 15px', borderRadius: '8px', fontWeight: '900'
};