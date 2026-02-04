'use client';

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    chargerTousLesMatchs();
  }, []);

  const chargerTousLesMatchs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setMatchs(data || []);
    setLoading(false);
  };

  const filteredMatchs = useMemo(() => {
    return matchs.filter(m => 
      m.clubA?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.clubB?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.competition?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matchs, searchTerm]);

  if (loading) return <div className="loading-state">Chargement des scores...</div>;

  return (
    <div className="page-container">
      {/* HEADER ALIGNÉ SUR TON ACCUEIL */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Résultats <span className="orange-dot">.</span></h1>
          <p className="subtitle">Consultez les derniers scores de la saison.</p>
        </div>
        <div className="header-right">
          <input 
            type="text" 
            placeholder="Rechercher un club ou une compétition..." 
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* GRILLE DE MATCHS TYPE "CARDS" */}
      <div className="matchs-grid">
        {filteredMatchs.map((m) => (
          <Link href={`/matchs/resultats/${m.id}`} key={m.id} className="match-card-link">
            <div className="match-card">
              {/* Barre de couleur latérale comme sur tes stats */}
              <div className={`status-border ${m.status === 'en-cours' ? 'bg-live' : 'bg-finished'}`}></div>
              
              <div className="card-content">
                <div className="card-top">
                  <span className="competition">🏆 {m.competition}</span>
                  <span className="date">{m.date ? m.date.split('T')[0].split('-').reverse().join('/') : 'NC'}</span>
                </div>

                <div className="main-score-row">
                  <div className="team-info home">
                    <span className="team-name">{m.clubA}</span>
                    <span className="team-cat">{m.equipeA}</span>
                  </div>

                  <div className="score-badge">
                    <span className="score-num">{m.scoreA ?? 0}</span>
                    <span className="score-sep">-</span>
                    <span className="score-num">{m.scoreB ?? 0}</span>
                  </div>

                  <div className="team-info away">
                    <span className="team-name">{m.clubB}</span>
                    <span className="team-cat">{m.equipeB}</span>
                  </div>
                </div>

                <div className="card-bottom">
                  <div className="location">📍 {m.lieu || 'Lieu non défini'}</div>
                  {m.status === 'en-cours' && <span className="live-tag">DIRECT</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .page-container { animation: fadeIn 0.4s ease; padding-bottom: 40px; }
        
        /* HEADER STYLE */
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .dashboard-header h1 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0; }
        .orange-dot { color: #f97316; }
        .subtitle { color: #64748b; font-size: 0.9rem; margin: 5px 0 0; }
        
        .search-input { 
          padding: 10px 16px; border-radius: 10px; border: 1px solid #e2e8f0; 
          background: white; width: 300px; outline: none; font-size: 0.85rem;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #f97316; }

        /* MATCH CARDS (Inspirées de tes Stats Cards) */
        .matchs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .match-card-link { text-decoration: none; color: inherit; }
        
        .match-card { 
          background: white; border-radius: 16px; display: flex; overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
          transition: transform 0.2s, box-shadow 0.2s; height: 100%;
        }
        .match-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1); }

        .status-border { width: 6px; flex-shrink: 0; }
        .bg-finished { background: #f97316; } /* Orange Dunkly */
        .bg-live { background: #22c55e; } /* Vert Live */

        .card-content { flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }

        .card-top { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .competition { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .date { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        .main-score-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 10px 0; }
        .team-info { display: flex; flex-direction: column; width: 35%; }
        .home { text-align: right; }
        .team-name { font-size: 1rem; font-weight: 800; color: #1e293b; text-transform: uppercase; }
        .team-cat { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }

        .score-badge { 
          background: #f8fafc; padding: 8px 16px; border-radius: 12px; 
          display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0;
        }
        .score-num { font-size: 1.4rem; font-weight: 900; color: #1e293b; }
        .score-sep { color: #cbd5e1; font-weight: bold; }

        .card-bottom { 
          margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.75rem; color: #64748b; font-weight: 600;
        }
        .live-tag { color: #22c55e; font-weight: 800; animation: pulse 2s infinite; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .matchs-grid { grid-template-columns: 1fr; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .search-input { width: 100%; }
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