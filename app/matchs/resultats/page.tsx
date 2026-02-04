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
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur parsing user", e);
      }
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

    if (error) {
      console.error("Erreur de chargement:", error.message);
    } else {
      setMatchs(data || []);
    }
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
        return <span className="status-badge finished">Terminé</span>;
      case 'en-cours':
        return <span className="status-badge live">● Direct</span>;
      default:
        return <span className="status-badge upcoming">À venir</span>;
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Chargement des scores...</p>
    </div>
  );

  return (
    <div className="results-container">
      {/* NOUVEAU TITRE HARMONISÉ */}
      <header className="page-header">
        <div className="title-stack">
          <span className="kicker">Compétitions 2025-2026</span>
          <h1 className="main-title">
            Tableau des <span className="text-orange">Résultats</span>
          </h1>
        </div>
        <Link href="/matchs/a-venir" className="calendar-btn">
          Calendrier complet
        </Link>
      </header>

      {/* LISTE DES MATCHS */}
      <div className="match-grid">
        {matchs.length > 0 ? (
          matchs.map((m) => (
            <Link href={`/matchs/resultats/${m.id}`} key={m.id} className="match-card">
              <div className="card-top">
                <div className="info-left">
                  {renderStatus(m.status)}
                  <span className="comp-tag">{m.competition}</span>
                </div>
                {isAdmin && (
                  <button onClick={(e) => supprimerMatch(e, m.id)} className="btn-delete">🗑️</button>
                )}
              </div>

              <div className="scoreboard">
                <div className="team home">
                  <span className={`team-name ${m.status === 'termine' && m.scoreA > m.scoreB ? 'winner' : ''}`}>
                    {m.clubA}
                  </span>
                  <span className="team-sub">{m.equipeA}</span>
                </div>

                <div className="score-display">
                  <div className="score-box">{m.scoreA ?? 0}</div>
                  <div className="score-sep">:</div>
                  <div className="score-box">{m.scoreB ?? 0}</div>
                </div>

                <div className="team away">
                  <span className={`team-name ${m.status === 'termine' && m.scoreB > m.scoreA ? 'winner' : ''}`}>
                    {m.clubB}
                  </span>
                  <span className="team-sub">{m.equipeB}</span>
                </div>
              </div>

              <div className="card-footer">
                <span>📍 {m.lieu || 'Terrain à définir'}</span>
                <span>📅 {m.date ? m.date.split('T')[0].split('-').reverse().join('/') : 'Date NC'}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">Aucun résultat pour le moment.</div>
        )}
      </div>

      <style jsx>{`
        .results-container { padding: 10px; animation: fadeIn 0.4s ease; }

        /* HEADER & TITRE */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .kicker { font-size: 0.8rem; font-weight: 800; color: #F97316; text-transform: uppercase; letter-spacing: 2px; }
        .main-title { font-size: 2.6rem; font-weight: 900; color: #0F172A; margin: 0; letter-spacing: -1.5px; line-height: 1.1; }
        .text-orange { color: #F97316; }
        .calendar-btn { background: #0F172A; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.85rem; transition: 0.2s; }
        .calendar-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }

        /* CARDS */
        .match-grid { display: flex; flex-direction: column; gap: 16px; }
        .match-card { 
          background: white; border-radius: 20px; padding: 25px; border: 1px solid #E2E8F0; 
          text-decoration: none; color: inherit; transition: 0.2s;
        }
        .match-card:hover { border-color: #F97316; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .info-left { display: flex; gap: 12px; align-items: center; }
        .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .finished { background: #F1F5F9; color: #475569; }
        .live { background: #FFEDD5; color: #F97316; }
        .upcoming { background: #F0FDF4; color: #16A34A; }
        .comp-tag { font-size: 0.75rem; color: #94A3B8; font-weight: 700; }

        /* SCOREBOARD */
        .scoreboard { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
        .team { flex: 1; display: flex; flex-direction: column; }
        .home { text-align: right; }
        .away { text-align: left; }
        .team-name { font-size: 1.2rem; font-weight: 800; color: #0F172A; text-transform: uppercase; }
        .winner { color: #F97316; }
        .team-sub { font-size: 0.75rem; color: #94A3B8; font-weight: 600; }

        .score-display { display: flex; align-items: center; gap: 8px; }
        .score-box { 
          background: #0F172A; color: white; width: 45px; height: 55px; 
          border-radius: 10px; display: flex; align-items: center; justify-content: center; 
          font-size: 1.6rem; font-weight: 900; border-bottom: 3px solid #F97316;
        }
        .score-sep { font-weight: 900; color: #CBD5E1; }

        .card-footer { display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #F8FAFC; font-size: 0.8rem; color: #94A3B8; font-weight: 600; }
        .btn-delete { background: #FEE2E2; border: none; padding: 6px; border-radius: 8px; cursor: pointer; }

        .loader-container { padding: 100px; text-align: center; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #F97316; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .main-title { font-size: 1.8rem; }
          .team-name { font-size: 0.95rem; }
          .score-box { width: 35px; height: 45px; font-size: 1.2rem; }
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