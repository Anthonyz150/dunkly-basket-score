"use client";

interface MatchProps {
    equipeA: string;
    equipeB: string;
    scoreA: number;
    scoreB: number;
    arbitrePrincipal: string;
  }
  
  export default function MatchCard({ equipeA, equipeB, scoreA, scoreB, arbitrePrincipal }: MatchProps) {
    return (
      <div style={{
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
          <span>{equipeA} <strong>{scoreA}</strong></span>
          <span>VS</span>
          <span><strong>{scoreB}</strong> {equipeB}</span>
        </div>
        <div style={{ marginTop: '10px', borderTop: '1px solid #444', paddingTop: '5px', fontSize: '0.8rem', color: '#aaa' }}>
          🏁 Arbitre : <span style={{ color: '#f59e0b' }}>{arbitrePrincipal}</span>
        </div>
      </div>
    );
  }