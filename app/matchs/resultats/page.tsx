'use client';

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("tous");

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    chargerTousLesMatchs();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const chargerTousLesMatchs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setMatchs(data || []);
    setLoading(false);
  };

  // LOGIQUE DE FILTRE DYNAMIQUE (JS)
  const filteredMatchs = useMemo(() => {
    return matchs.filter(m => {
      const matchesSearch = m.clubA.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.clubB.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === "tous" ? true : m.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [matchs, searchTerm, filter]);

  // ANIMATION DE PARALLAXE SUR LES CARTES (JS)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'termine': return <span className="status-badge finished">Terminé</span>;
      case 'en-cours': return <span className="status-badge live">● Direct</span>;
      default: return <span className="status-badge upcoming">À venir</span>;
    }
  };

  if (loading) return <div className="loading-screen"><div className="ball">🏀</div></div>;

  return (
    <div className="results-container">
      <header className="page-header">
        <div className="title-stack">
          <span className="kicker">Live Scores</span>
          <h1 className="main-title">Résultats</h1>
        </div>
        
        {/* BARRE DE RECHERCHE DYNAMIQUE */}
        <div className="controls">
          <input 
            type="text" 
            placeholder="Rechercher un club..." 
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" onChange={(e) => setFilter(e.target.value)}>
            <option value="tous">Tous les matchs</option>
            <option value="termine">Terminés</option>
            <option value="en-cours">En direct</option>
          </select>
        </div>
      </header>

      <div className="match-grid">
        {filteredMatchs.map((m, index) => (
          <div 
            key={m.id} 
            className="match-card-wrapper" 
            style={{ animationDelay: `${index * 0.1}s` }} // Entrée séquencée
            onMouseMove={handleMouseMove}
          >
            <Link href={`/matchs/resultats/${m.id}`} className="match-card">
              <div className="gloss-effect"></div>
              <div className="card-top">
                <div className="info-left">
                  {renderStatus(m.status)}
                  <span className="comp-tag">{m.competition}</span>
                </div>
                <span className="date-tag">{m.date?.split('T')[0].split('-').reverse().join('/')}</span>
              </div>

              <div className="scoreboard">
                <div className="team home">
                  <span className="team-name">{m.clubA}</span>
                  <span className="team-sub">{m.equipeA}</span>
                </div>

                <div className="score-area">
                  <div className="score-box">{m.scoreA ?? 0}</div>
                  <div className="score-sep">:</div>
                  <div className="score-box">{m.scoreB ?? 0}</div>
                </div>

                <div className="team away">
                  <span className="team-name">{m.clubB}</span>
                  <span className="team-sub">{m.equipeB}</span>
                </div>
              </div>

              <div className="card-footer">
                <span>📍 {m.lieu || 'Terrain à définir'}</span>
                <span className="view-more">Détails du match →</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .results-container { padding: 10px; max-width: 1100px; margin: 0 auto; }

        /* HEADER & CONTROLS */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
        .kicker { font-size: 0.8rem; font-weight: 800; color: #F97316; text-transform: uppercase; letter-spacing: 3px; }
        .main-title { font-size: 3rem; font-weight: 900; color: #0F172A; margin: 0; letter-spacing: -2px; }
        
        .controls { display: flex; gap: 10px; }
        .search-input, .filter-select { 
          padding: 12px 18px; border-radius: 14px; border: 1px solid #E2E8F0; 
          font-weight: 600; font-family: inherit; outline: none; transition: 0.2s;
        }
        .search-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }

        /* MATCH CARD ANIMATIONS */
        .match-grid { display: flex; flex-direction: column; gap: 18px; }
        .match-card-wrapper { 
          opacity: 0; transform: translateY(20px); 
          animation: slideIn 0.5s forwards ease-out;
          position: relative;
        }

        .match-card { 
          display: block; background: white; border-radius: 24px; padding: 30px; 
          text-decoration: none; color: inherit; border: 1px solid #E2E8F0;
          position: relative; overflow: hidden; transition: transform 0.1s ease-out;
        }

        /* EFFET DE LUEUR JS */
        .gloss-effect {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at var(--x) var(--y), rgba(249, 115, 22, 0.08) 0%, transparent 60%);
        }

        .match-card:hover { border-color: #F97316; }

        /* SCOREBOARD */
        .card-top { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .info-left { display: flex; gap: 12px; align-items: center; }
        .status-badge { padding: 5px 12px; border-radius: 10px; font-size: 0.7rem; font-weight: 800; }
        .finished { background: #F1F5F9; color: #475569; }
        .live { background: #F97316; color: white; animation: blink 1.5s infinite; }
        .upcoming { background: #E0F2FE; color: #0284C7; }

        .scoreboard { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .team { flex: 1; display: flex; flex-direction: column; }
        .home { text-align: right; }
        .away { text-align: left; }
        .team-name { font-size: 1.4rem; font-weight: 900; color: #0F172A; text-transform: uppercase; }
        .team-sub { color: #94A3B8; font-weight: 600; font-size: 0.8rem; }

        .score-area { display: flex; align-items: center; gap: 10px; }
        .score-box { 
          background: #0F172A; color: white; width: 55px; height: 65px; 
          border-radius: 15px; display: flex; align-items: center; justify-content: center; 
          font-size: 2rem; font-weight: 900; box-shadow: 0 8px 0 #F97316;
        }
        .score-sep { font-size: 1.5rem; font-weight: 900; color: #CBD5E1; }

        .card-footer { 
          margin-top: 25px; padding-top: 20px; border-top: 1px solid #F1F5F9;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.8rem; color: #94A3B8; font-weight: 700;
        }
        .view-more { color: #F97316; opacity: 0; transition: 0.3s; transform: translateX(-10px); }
        .match-card:hover .view-more { opacity: 1; transform: translateX(0); }

        /* KEYFRAMES */
        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 50% { opacity: 0.7; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-screen { height: 60vh; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
        .ball { animation: spin 1s infinite linear; }

        @media (max-width: 768px) {
          .main-title { font-size: 2rem; }
          .team-name { font-size: 1rem; }
          .score-box { width: 40px; height: 50px; font-size: 1.4rem; }
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
// STYLES CSS-IN-JS
const containerStyle = { padding: '20px', maxWidth: '1000px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const gridStyle = { display: 'flex', flexDirection: 'column' as const, gap: '15px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' };
const infoSideStyle = { display: 'flex', flexDirection: 'column' as const };
const teamsRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' };
const teamBlock = { display: 'flex', flexDirection: 'column' as const, flex: 1, textAlign: 'center' as const };
const clubTitleStyle = { fontWeight: '800', fontSize: '1.1rem', color: '#1e293b', textTransform: 'uppercase' as const };
const winClubName = { ...clubTitleStyle, color: '#F97316' };
const teamSmallStyle = { fontSize: '0.75rem', color: '#64748b', fontWeight: '600' };
const scoreBoxStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '0 20px' };
const scoreValue = { fontSize: '2.2rem', fontWeight: '900', color: '#1e293b', fontFamily: 'monospace' };
const dateBadgeStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' };
const statusBadge = { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900' };
const footerDetail = { fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' };
const deleteBtnStyle = { background: '#fee2e2', border: 'none', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', zIndex: 10 };
const linkBtnStyle = { textDecoration: 'none', color: '#F97316', fontWeight: 'bold', fontSize: '0.9rem' };
const emptyCardStyle = { textAlign: 'center' as const, padding: '60px', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' };