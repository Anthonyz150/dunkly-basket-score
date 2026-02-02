"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);

  useEffect(() => {
    // CORRECTION : On précise que c'est un tableau avec : any[]
    const allMatchs: any[] = getFromLocal('matchs') || [];
    
    // Désormais, .filter() ne posera plus de problème au build
    setMatchs(allMatchs.filter((m: any) => m.status === 'a-venir'));
  }, []);

  if (matchs.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <span style={{ fontSize: '3.5rem' }}>📅</span>
        <h2 style={{ color: '#1E293B', margin: '10px 0 5px 0', fontWeight: '800' }}>Aucun match à venir</h2>
        <p style={{ color: '#64748B' }}>Le calendrier des prochaines rencontres est vide.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1E293B', margin: 0 }}>
          Prochains Matchs <span style={{ color: '#F97316' }}>.</span>
        </h1>
        <p style={{ color: '#64748B' }}>Préparez les prochaines rencontres du championnat.</p>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {matchs.map((m) => (
          <div key={m.id} style={matchCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={badgeStyle}>{m.competition}</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B' }}>
                  {m.equipeA} <span style={{ color: '#CBD5E1', margin: '0 10px' }}>vs</span> {m.equipeB}
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#1E293B' }}>{m.date}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>🏁 {m.arbitre || 'Arbitre à désigner'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// STYLES (Conservés à l'identique)
const emptyStateStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '70vh', textAlign: 'center'
};

const matchCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '20px',
  border: '1px solid #F1F5F9',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
};

const badgeStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '800',
  backgroundColor: '#F9731615',
  color: '#F97316',
  padding: '4px 10px',
  borderRadius: '6px',
  textTransform: 'uppercase',
  alignSelf: 'flex-start'
};