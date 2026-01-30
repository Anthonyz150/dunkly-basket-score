'use client';
import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0, arbitres: 0 });
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Barre de recherche

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
      match.status === 'en_cours' || (match.scoreA + match.scoreB) > 0
    );
    if (matchActif) setLiveMatch(matchActif);
  }, []);

  // 📥 Fonction d'exportation (JSON pour Excel)
  const exportData = () => {
    const data = {
      matchs: getFromLocal('matchs'),
      equipes: getFromLocal('equipes'),
      arbitres: getFromLocal('arbitres'),
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
          <span className="basketball-icon">🏀</span>
          <h1>DUNKLY <span className="version-tag">v1.0</span></h1>
        </div>
        
        {/* 🔍 Barre de recherche stylisée */}
        <div className="search-container" style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Rechercher une compétition, une équipe..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs ce jour" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <div className="dashboard-lower-grid">
        <section className="card actions-section">
          <h2 className="section-title">{isAdmin ? "ADMINISTRATION" : "ACCÈS RAPIDE"}</h2>
          <div className="actions-list">
            {isAdmin ? (
              <>
                <ActionLink href="/matchs" icon="➕" text="Enregistrer un résultat" />
                <ActionLink href="/equipes" icon="👥" text="Inscrire une équipe" />
                <button onClick={exportData} style={exportBtnStyle}>
                  <span>📥</span> <span>Exporter les données de la saison</span>
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

        {liveMatch ? (
          <section className="live-match-card">
            <h2 className="live-title">LIVE</h2>
            <div className="live-display">
              <p className="live-comp-name">{liveMatch.competition}</p>
              <div className="live-score-row">
                <span className="live-team">{liveMatch.equipeA}</span>
                <span className="live-score-digits">{liveMatch.scoreA} - {liveMatch.scoreB}</span>
                <span className="live-team">{liveMatch.equipeB}</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="card no-live-placeholder">Aucun match en direct</div>
        )}
      </div>
    </div>
  );
}

// Styles rapides en ligne pour les nouveaux éléments
const searchInputStyle = {
  width: '100%',
  padding: '12px 20px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const exportBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  width: '100%',
  padding: '15px',
  background: '#f0f0f0',
  border: '1px dashed #ccc',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#444',
  marginTop: '10px'
};

function StatCard({ title, value, color }: any) {
  return (
    <div className="card stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <p className="stat-label">{title}</p>
      <h3 className="stat-number">{value}</h3>
    </div>
  );
}

function ActionLink({ href, icon, text }: any) {
  return (
    <Link href={href} className="action-row">
      <span className="action-icon">{icon}</span>
      <span className="action-text">{text}</span>
    </Link>
  );
}