'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    chargerTousLesMatchs();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || 
                  user?.username?.toLowerCase() === 'admin' || 
                  user?.email === 'anthony.didier.pro@gmail.com';

  const chargerTousLesMatchs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .order('date', { ascending: false });

    if (!error) setMatchs(data || []);
    setLoading(false);
  };

  const supprimerMatch = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("⚠️ Voulez-vous vraiment supprimer ce match ?")) return;
    try {
      const { error } = await supabase.from('matchs').delete().eq('id', id);
      if (error) throw error;
      setMatchs(matchs.filter(m => m.id !== id));
    } catch (error: any) {
      alert("Erreur : " + error.message);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'termine':
        return <span className="status-pill finished">Terminé</span>;
      case 'en-cours':
        return <span className="status-pill live">● Direct</span>;
      default:
        return <span className="status-pill upcoming">À venir</span>;
    }
  };

  if (loading) return (
    <div className="loader-box">
      <div className="spinner"></div>
      <p>Récupération des scores...</p>
    </div>
  );

  return (
    <div className="results-container">
      {/* NOUVELLE INTERFACE DE TITRE */}
      <header className="results-header">
        <div className="title-block">
          <span className="subtitle">Saison 2025/2026</span>
          <h1 className="main-title">Scores & <span className="orange">Résultats</span></h1>
        </div>
        <Link href="/matchs/a-venir" className="calendar-link">
          Calendrier complet →
        </Link>
      </header>

      <div className="matchs-grid">
        {matchs.length > 0 ? (
          matchs.map((m) => (
            <Link href={`/matchs/resultats/${m.id}`} key={m.id} className="match-card-wrapper">
              <div className="match-card">
                <div className="card-top">
                  <div className="meta-info">
                    {renderStatus(m.status)}
                    <span className="competition-tag">{m.competition}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={(e) => supprimerMatch(e, m.id)} className="del-btn">🗑️</button>
                  )}
                </div>

                <div className="scoreboard">
                  <div className="team home">
                    <span className={`team-name ${m.status === 'termine' && m.scoreA > m.scoreB ? 'winner' : ''}`}>
                      {m.clubA}
                    </span>
                    <span className="team-sub">{m.equipeA}</span>
                  </div>

                  <div className="score-center">
                    <span className="score-digit">{m.scoreA ?? 0}</span>
                    <span className="score-sep">:</span>
                    <span className="score-digit">{m.scoreB ?? 0}</span>
                  </div>

                  <div className="team away">
                    <span className={`team-name ${m.status === 'termine' && m.scoreB > m.scoreA ? 'winner' : ''}`}>
                      {m.clubB}
                    </span>
                    <span className="team-sub">{m.equipeB}</span>
                  </div>
                </div>

                <div className="card-bottom">
                  <div className="match-loc">📍 {m.lieu || 'Terrain inconnu'}</div>
                  <div className="match-date">{m.date ? m.date.split('T')[0].split('-').reverse().join('/') : ''}</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">Aucun résultat disponible pour le moment.</div>
        )}
      </div>

      <style jsx>{`
        .results-container { padding: 10px; max-width: 1100px; margin: 0 auto; animation: fadeInUp 0.5s ease; }
        
        /* HEADER */
        .results-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
        .subtitle { font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
        .main-title { font-size: 2.8rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1; letter-spacing: -1.5px; }
        .orange { color: var(--primary, #f97316); }
        .calendar-link { text-decoration: none; color: #64748b; font-weight: 700; font-size: 0.9rem; transition: color 0.2s; }
        .calendar-link:hover { color: #f97316; }

        /* GRID */
        .matchs-grid { display: grid; gap: 20px; }
        .match-card-wrapper { text-decoration: none; color: inherit; }
        .match-card { 
          background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .match-card:hover { transform: translateY(-5px); border-color: #f97316; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

        /* SCOREBOARD */
        .scoreboard { display: flex; align-items: center; justify-content: space-between; margin: 25px 0; }
        .team { display: flex; flex-direction: column; flex: 1; }
        .home { text-align: right; }
        .away { text-align: left; }
        .team-name { font-size: 1.3rem; font-weight: 900; color: #1e293b; text-transform: uppercase; }
        .team-name.winner { color: #f97316; position: relative; }
        .team-sub { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        
        .score-center { display: flex; align-items: center; gap: 15px; padding: 0 30px; }
        .score-digit { font-size: 2.8rem; font-weight: 900; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
        .score-sep { color: #cbd5e1; font-size: 1.5rem; font-weight: 300; }

        /* PILLS */
        .meta-info { display: flex; gap: 10px; align-items: center; }
        .status-pill { padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .finished { background: #f1f5f9; color: #475569; }
        .live { background: #ffedd5; color: #f97316; animation: pulse 2s infinite; }
        .upcoming { background: #ecfdf5; color: #10b981; }
        .competition-tag { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

        .card-bottom { display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #f8fafc; font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        .del-btn { background: #fee2e2; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; }

        .loader-box { padding: 100px; text-align: center; color: #94a3b8; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f97316; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .main-title { font-size: 1.8rem; }
          .score-digit { font-size: 1.8rem; }
          .team-name { font-size: 1rem; }
          .scoreboard { margin: 15px 0; }
          .score-center { padding: 0 15px; }
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