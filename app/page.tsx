"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0, arbitres: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Récupération de l'utilisateur (uniquement côté client)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Récupération des stats avec gestion de secours (fallback)
    const c = getFromLocal('competitions') || [];
    const e = getFromLocal('equipes') || [];
    const m = getFromLocal('matchs') || [];
    const a = getFromLocal('arbitres') || [];
    
    setStats({ 
        compets: Array.isArray(c) ? c.length : 0, 
        equipes: Array.isArray(e) ? e.length : 0, 
        matchs: Array.isArray(m) ? m.length : 0, 
        arbitres: Array.isArray(a) ? a.length : 0 
    });
  }, []);

  const isAdmin = user?.username === 'admin';

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* HEADER DUNKLY */}
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', margin: 0, color: '#e65100' }}>🏀 DUNKLY</h1>
        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>Gestionnaire de championnats</p>
      </header>

      {/* STATISTIQUES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={statBoxStyle}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.compets}</span><br/>
          <span style={{ color: '#666', fontSize: '12px' }}>Compétitions</span>
        </div>
        <div style={statBoxStyle}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.equipes}</span><br/>
          <span style={{ color: '#666', fontSize: '12px' }}>Équipes</span>
        </div>
        <div style={statBoxStyle}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.matchs}</span><br/>
          <span style={{ color: '#666', fontSize: '12px' }}>Matchs</span>
        </div>
        <div style={statBoxStyle}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.arbitres}</span><br/>
          <span style={{ color: '#666', fontSize: '12px' }}>Arbitres</span>
        </div>
      </div>

      {/* MENU DE NAVIGATION */}
      <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '16px', marginTop: 0, marginBottom: '15px', color: '#444', textAlign: 'center' }}>
          {isAdmin ? "🛠️ ADMINISTRATION" : "🚀 ACCÈS RAPIDE"}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/matchs" style={linkStyle}>⏱️ Scores & Résultats</Link>
          <Link href="/equipes" style={linkStyle}>👥 Liste des Équipes</Link>
          <Link href="/arbitres" style={linkStyle}>🏁 Liste des Arbitres</Link>
          
          {isAdmin && (
            <div style={{ marginTop: '10px', padding: '15px', border: '2px dashed #ffb74d', borderRadius: '10px', background: '#fff9f0' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e65100', fontWeight: 'bold', textAlign: 'center' }}>MODE ADMIN</p>
              <Link href="/admin" style={{ ...linkStyle, background: '#e65100', color: 'white', border: 'none' }}>⚙️ Gérer le Système</Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

// STYLES
const statBoxStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  border: '1px solid #eee',
  boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
};

const linkStyle = {
  display: 'block',
  padding: '14px',
  background: 'white',
  borderRadius: '10px',
  textDecoration: 'none',
  color: '#333',
  fontWeight: '600' as const,
  border: '1px solid #eee',
  textAlign: 'center' as const,
  transition: '0.2s'
};