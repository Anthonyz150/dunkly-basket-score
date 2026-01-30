'use client';
import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0, arbitres: 0 });
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Récupération de l'utilisateur pour gérer les droits d'affichage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Récupération des données
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

  // Définition du rôle
  const isAdmin = user?.username === 'admin';

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-title-row">
          <span className="basketball-icon">🏀</span>
          <h1>DUNKLY <span className="version-tag">v1.0</span></h1>
        </div>
        <p className="welcome-text">
          Bienvenue, <strong>{user?.username}</strong>. Voici l'état actuel de tes championnats.
        </p>
      </header>

      <div className="stats-grid">
        <StatCard title="Compétitions" value={stats.compets} color="#e65100" />
        <StatCard title="Équipes" value={stats.equipes} color="#0277bd" />
        <StatCard title="Matchs ce jour" value={stats.matchs} color="#2e7d32" />
        <StatCard title="Arbitres" value={stats.arbitres} color="#ef6c00" />
      </div>

      <div className="dashboard-lower-grid">
        {/* SECTION DYNAMIQUE SELON LE RÔLE */}
        <section className="card actions-section">
          <h2 className="section-title">
            {isAdmin ? "DERNIÈRES ACTIONS" : "ACCÈS RAPIDE"}
          </h2>
          
          <div className="actions-list">
            {isAdmin ? (
              <>
                <ActionLink href="/matchs" icon="➕" text="Enregistrer un résultat" />
                <ActionLink href="/equipes" icon="👥" text="Inscrire une équipe" />
                <ActionLink href="/competitions" icon="🏆" text="Créer un tournoi" />
              </>
            ) : (
              <>
                <ActionLink href="/matchs" icon="⏱️" text="Consulter les résultats" />
                <ActionLink href="/equipes" icon="👥" text="Voir les équipes" />
                <ActionLink href="/competitions" icon="🏆" text="Liste des championnats" />
              </>
            )}
          </div>
        </section>

        {liveMatch ? (
          <section className="live-match-card">
            <h2 className="live-title">MATCH EN COURS</h2>
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
          <div className="card no-live-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>Aucun match en direct pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Les sous-composants restent identiques
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