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

  const renderStatus = (status: string) => {
    switch (status) {
      case 'termine': return <span className="st-badge finished">Terminé</span>;
      case 'en-cours': return <span className="st-badge live">Direct</span>;
      default: return <span className="st-badge upcoming">À venir</span>;
    }
  };

  if (loading) return <div className="loader-full">Chargement...</div>;

  return (
    <div className="results-page">
      {/* Header aligné sur le style Sidebar */}
      <header className="page-header">
        <div className="header-txt">
          <h1>Résultats des Matchs</h1>
          <p>Saison régulière 2025/2026</p>
        </div>
        <Link href="/matchs/a-venir" className="add-btn">Calendrier</Link>
      </header>

      <div className="results-list">
        {matchs.map((m) => (
          <div key={m.id} className="match-row">
            <Link href={`/matchs/resultats/${m.id}`} className="match-link">
              
              <div className="match-top-info">
                {renderStatus(m.status)}
                <span className="match-comp">🏆 {m.competition}</span>
                <span className="match-date">📅 {m.date?.split('T')[0].split('-').reverse().join('/')}</span>
              </div>

              <div className="match-main">
                <div className="team home">
                  <span className="t-name">{m.clubA}</span>
                  <span className="t-cat">{m.equipeA}</span>
                </div>

                <div className="score-block">
                  <div className="score-box">{m.scoreA ?? 0}</div>
                  <div className="score-sep">:</div>
                  <div className="score-box">{m.scoreB ?? 0}</div>
                </div>

                <div className="team away">
                  <span className="t-name">{m.clubB}</span>
                  <span className="t-cat">{m.equipeB}</span>
                </div>
              </div>

              <div className="match-bottom">
                <span>📍 {m.lieu || 'Non défini'}</span>
                <span>⚖️ {m.arbitre || 'NC'}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .results-page { animation: fadeIn 0.3s ease-in; }
        
        /* HEADER STYLE (Harmonisé avec la Sidebar) */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-txt h1 { font-size: 2rem; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -1px; }
        .header-txt p { color: #64748B; margin: 5px 0 0; font-weight: 500; }
        .add-btn { background: #0F172A; color: white; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: 0.2s; }
        .add-btn:hover { background: #F97316; }

        /* LISTE ET LIGNES */
        .results-list { display: flex; flex-direction: column; gap: 16px; }
        .match-row { background: white; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; transition: 0.2s; }
        .match-row:hover { border-color: #F97316; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .match-link { text-decoration: none; color: inherit; display: block; padding: 20px; }

        /* TOP INFO */
        .match-top-info { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .st-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
        .finished { background: #F1F5F9; color: #475569; }
        .live { background: #FFEDD5; color: #F97316; }
        .upcoming { background: #E0F2FE; color: #0284C7; }
        .match-comp { font-size: 0.75rem; color: #64748B; font-weight: 700; flex: 1; }
        .match-date { font-size: 0.75rem; color: #94A3B8; font-weight: 600; }

        /* MAIN SCOREBOARD (Harmonisé Dark/Orange) */
        .match-main { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 10px 0; }
        .team { flex: 1; display: flex; flex-direction: column; }
        .home { text-align: right; }
        .away { text-align: left; }
        .t-name { font-size: 1.1rem; font-weight: 800; color: #0F172A; text-transform: uppercase; }
        .t-cat { font-size: 0.75rem; color: #94A3B8; font-weight: 600; }

        .score-block { display: flex; align-items: center; gap: 10px; }
        .score-box { background: #0F172A; color: white; width: 45px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border-bottom: 3px solid #F97316; }
        .score-sep { font-weight: 900; color: #CBD5E1; }

        /* BOTTOM */
        .match-bottom { margin-top: 15px; padding-top: 15px; border-top: 1px solid #F8FAFC; display: flex; justify-content: space-between; font-size: 0.75rem; color: #94A3B8; font-weight: 600; }

        @media (max-width: 768px) {
          .t-name { font-size: 0.9rem; }
          .score-box { width: 35px; height: 45px; font-size: 1.2rem; }
          .page-header h1 { font-size: 1.5rem; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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