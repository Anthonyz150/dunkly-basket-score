'use client'; // Indispensable pour éviter l'erreur de build Vercel

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0, arbitres: 0 });
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    // Récupération de l'utilisateur connecté
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Récupération sécurisée des données (tableau vide par défaut)
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

    // Recherche d'un match en direct ou avec un score existant
    const matchActif = m.find((match: any) => 
      match.status === 'en_cours' || (match.scoreA + match.scoreB) > 0
    );
    if (matchActif) setLiveMatch(matchActif);
  }, []);

  // Fonction d'exportation au format JSON
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
    link.download = `dunkly_data_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const isAdmin = user?.username === 'admin';

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-title-row">
          <span className="basketball-icon" style={{ fontSize: '2rem' }}>🏀</span>
          <h1>DUNKLY <span className="version-tag">v1.0</span></h1>
        </div>
        
        {/* Barre de recherche */}
        <div className="search-container" style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Rechercher une compétition, une équipe..." 
            className="search-input-pro"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </header>

      {/* Grille des statistiques */}
      <div className="stats-grid">
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <div className="dashboard-lower-grid">
        {/* Actions selon le rôle */}
        <section className="card actions-section">
          <h2 className="section-title">{isAdmin ? "ADMINISTRATION" : "ACCÈS RAPIDE"}</h2>
          <div className="actions-list">
            {isAdmin ? (
              <>
                <ActionLink href="/matchs" icon="➕" text="Enregistrer un résultat" />
                <ActionLink href="/equipes" icon="👥" text="Inscrire une équipe" />
                <button onClick={exportData} style={exportBtnStyle}>
                  <span>📥</span> <span>Exporter la base de données</span>
                </button>
              </>
            ) : (
              <>
                <ActionLink href="/matchs" icon="⏱️" text="Consulter les scores" />
                <ActionLink href="/arbitres" icon="🏁" text="Liste des arbitres" />
              </>
            )}
          </div>
        </section>

        {/* Bloc Live Match */}
        {liveMatch ? (
          <section className="live-match-card">
            <h2 className="live-title">LIVE 🏀</h2>
            <div className="live-display">
              <p className="live-comp-name" style={{ color: '#f39c12', fontSize: '0.8rem' }}>{liveMatch.competition}</p>
              <div className="live-score-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
                <span className="live-team" style={{ fontWeight: 'bold' }}>{liveMatch.equipeA}</span>
                <span className="live-score-digits" style={{ fontSize: '2.5rem', fontWeight: '900' }}>{liveMatch.scoreA} - {liveMatch.scoreB}</span>
                <span className="live-team" style={{ fontWeight: 'bold' }}>{liveMatch.equipeB}</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="card no-live-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#999', background: 'white', borderRadius: '12px' }}>
            <p>Aucun match en direct pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles objets pour éviter les erreurs de compilation CSS dans le build
const searchInputStyle = {
  width: '100%',
  padding: '12px 20px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none'
};

const exportBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  width: '100%',
  padding: '15px',
  background: '#f8f9fa',
  border: '1px dashed #ccc',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  color: '#444',
  marginTop: '10px'
};

function StatCard({ title, value, color }: any) {
  return (
    <div className="card stat-card" style={{ borderLeft: `5px solid ${color}`, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</p>
      <h3 style={{ margin: '10px 0 0', fontSize: '2.5rem', fontWeight: 'bold' }}>{value}</h3>
    </div>
  );
}

function ActionLink({ href, icon, text }: any) {
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: '600', marginBottom: '10px' }}>
      <span>{icon}</span>
      <span>{text}</span>
    </Link>
  );
}