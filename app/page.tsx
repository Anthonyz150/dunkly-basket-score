"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0, arbitres: 0 });
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    const c = getFromLocal('competitions') || [];
    const e = getFromLocal('equipes') || [];
    const m = getFromLocal('matchs') || [];
    const a = getFromLocal('arbitres') || [];
    
    setStats({ 
        compets: c.length, 
        equipes: e.length, 
        matchs: m.length, 
        arbitres: a.length 
    });

    const matchActif = m.find((match: any) => 
      match.status === 'en_cours' || (Number(match.scoreA) + Number(match.scoreB)) > 0
    );
    if (matchActif) setLiveMatch(matchActif);
  }, []);

  const exportData = () => {
    const data = {
      matchs: getFromLocal('matchs') || [],
      equipes: getFromLocal('equipes') || [],
      arbitres: getFromLocal('arbitres') || [],
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dunkly_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const isAdmin = user?.username === 'admin';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '2rem' }}>🏀</span>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#333' }}>
            DUNKLY <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>v1.0</span>
          </h1>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Rechercher une compétition, une équipe..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <section style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#666' }}>{isAdmin ? "ADMINISTRATION" : "ACCÈS RAPIDE"}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ActionLink href="/matchs" icon="⏱️" text="Scores & Résultats" />
            <ActionLink href="/equipes" icon="👥" text="Gestion des Équipes" />
            {isAdmin && (
              <button onClick={exportData} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '15px',
                background: '#fdf2f2', border: '1px dashed #f87171', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 'bold', color: '#b91c1c', marginTop: '5px'
              }}>
                📥 Exporter la base (Backup)
              </button>
            )}
          </div>
        </section>

        <section style={{ background: '#1a1a1a', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#f39c12' }}>LIVE DIRECT 🏀</h2>
          {liveMatch ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>{liveMatch.competition}</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontWeight: 'bold', flex: 1 }}>{liveMatch.equipeA}</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f39c12' }}>{liveMatch.scoreA} - {liveMatch.scoreB}</span>
                <span style={{ fontWeight: 'bold', flex: 1 }}>{liveMatch.equipeB}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Aucun match en cours</div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <div style={{ borderLeft: `6px solid ${color}`, background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <p style={{ margin: 0, color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</p>
      <h3 style={{ margin: '5px 0 0', fontSize: '1.8rem', fontWeight: '800' }}>{value}</h3>
    </div>
  );
}

function ActionLink({ href, icon, text }: any) {
  return (
    <Link href={href} style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', 
        background: '#f8f9fa', borderRadius: '10px', textDecoration: 'none', 
        color: '#333', fontWeight: '600', border: '1px solid #eee'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span>{text}</span>
    </Link>
  );
}