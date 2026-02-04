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
      m.clubA.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.clubB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.competition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matchs, searchTerm]);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-wrapper">
      {/* HEADER TYPE DASHBOARD */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Résultats <span className="dot">.</span></h1>
          <p className="welcome-msg">Consultez les derniers scores de la saison.</p>
        </div>
        <div className="header-actions">
           <input 
              type="text" 
              placeholder="Rechercher..." 
              className="search-bar"
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {/* GRILLE DE CARTES */}
      <div className="results-grid">
        {filteredMatchs.map((m) => (
          <Link href={`/matchs/resultats/${m.id}`} key={m.id} className="match-card">
            {/* La petite barre de couleur à gauche comme sur tes captures */}
            <div className={`side-accent ${m.status === 'termine' ? 'finished' : 'live'}`}></div>
            
            <div className="card-body">
              <div className="card-meta">
                <span className="comp-tag">🏆 {m.competition}</span>
                <span className="date-tag">{m.date?.split('T')[0].split('-').reverse().join('/')}</span>
              </div>

              <div className="score-row">
                <div className="team-info">
                  <span className="t-name">{m.clubA}</span>
                  <span className="t-cat">{m.equipeA}</span>
                </div>
                
                <div className="score-center">
                  <span className="score">{m.scoreA ?? 0}</span>
                  <span className="sep">-</span>
                  <span className="score">{m.scoreB ?? 0}</span>
                </div>

                <div className="team-info text-right">
                  <span className="t-name">{m.clubB}</span>
                  <span className="t-cat">{m.equipeB}</span>
                </div>
              </div>

              <div className="card-footer">
                <span>📍 {m.lieu || 'Terrain non défini'}</span>
                {m.status === 'en-cours' && <span className="live-indicator">EN DIRECT</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .page-wrapper { animation: fadeIn 0.4s ease-out; }

        /* TITRE DASHBOARD */
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .dashboard-header h1 { font-size: 1.8rem; font-weight: 800; color: #1E293B; margin: 0; }
        .dot { color: #F97316; }
        .welcome-msg { color: #64748B; font-size: 0.9rem; margin-top: 4px; }

        .search-bar { 
          padding: 10px 15px; border-radius: 8px; border: 1px solid #E2E8F0; 
          background: white; outline: none; font-size: 0.85rem; width: 250px;
        }

        /* CARTES INSPIRÉES DU DASHBOARD */
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 20px; }
        
        .match-card { 
          background: white; border-radius: 12px; display: flex; overflow: hidden;
          text-decoration: none; color: inherit; border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: 0.2s;
        }
        .match-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

        .side-accent { width: 6px; }
        .side-accent.finished { background: #F97316; } /* Orange Dunkly */
        .side-accent.live { background: #22C55E; } /* Vert pour le live */

        .card-body { flex: 1; padding: 20px; }
        
        .card-meta { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .comp-tag { font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; }
        .date-tag { font-size: 0.75rem; color: #94A3B8; }

        .score-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .team-info { display: flex; flex-direction: column; width: 35%; }
        .text-right { text-align: right; }
        .t-name { font-size: 1rem; font-weight: 800; color: #1E293B; }
        .t-cat { font-size: 0.7rem; color: #94A3B8; font-weight: 600; }

        .score-center { display: flex; align-items: center; gap: 10px; background: #F8FAFC; padding: 8px 15px; border-radius: 8px; }
        .score { font-size: 1.4rem; font-weight: 900; color: #1E293B; }
        .sep { color: #CBD5E1; font-weight: bold; }

        .card-footer { display: flex; justify-content: space-between; border-top: 1px solid #F1F5F9; paddingTop: 12px; margin-top: 5px; font-size: 0.75rem; color: #64748B; font-weight: 600; }
        .live-indicator { color: #22C55E; animation: pulse 2s infinite; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
          .results-grid { grid-template-columns: 1fr; }
          .search-bar { width: 100%; margin-top: 15px; }
          .dashboard-header { flex-direction: column; }
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