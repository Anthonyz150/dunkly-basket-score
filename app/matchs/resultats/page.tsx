'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

// NOTE : Aucun import de globals.css ici. Le Layout s'en charge.

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

    if (!confirm("⚠️ Voulez-vous vraiment supprimer ce match et son résultat ?")) return;

    try {
      const { error } = await supabase
        .from('matchs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMatchs(matchs.filter(m => m.id !== id));
    } catch (error: any) {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'termine':
        return <span style={{ ...statusBadge, backgroundColor: '#dcfce7', color: '#16a34a' }}>✅ TERMINÉ</span>;
      case 'en-cours':
        return <span style={{ ...statusBadge, backgroundColor: '#fef9c3', color: '#ca8a04' }}>⏱️ EN COURS</span>;
      default:
        return <span style={{ ...statusBadge, backgroundColor: '#f1f5f9', color: '#64748b' }}>📅 À VENIR</span>;
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>Chargement des matchs...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* HEADER AVEC BOUTON RETOUR */}
      <div className="header-mobile" style={headerStyle}>
        <div>
          <h1 className="title-mobile" style={{ margin: 0, fontWeight: '900', fontSize: '2.2rem', color: '#111827' }}>🏀 TOUS LES MATCHS</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Suivi complet de la compétition</p>
        </div>
        <Link href="/matchs/a-venir" style={linkBtnStyle}>← Matchs à venir</Link>
      </div>

      {/* GRILLE DES MATCHS */}
      <div style={gridStyle}>
        {matchs.length > 0 ? (
          matchs.map((m) => (
            <div key={m.id} style={{ position: 'relative' }}>
              <Link 
                href={`/matchs/resultats/${m.id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={cardStyle} className="match-card">
                  <div style={infoSideStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div className="badges-mobile" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {renderStatus(m.status)}
                        <span style={dateBadgeStyle}>
                          {m.date ? m.date.replace('T', ' à ') : "Date non fixée"}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {isAdmin && (
                          <button 
                            onClick={(e) => supprimerMatch(e, m.id)}
                            style={deleteBtnStyle}
                            title="Supprimer le match"
                          >
                            🗑️
                          </button>
                        )}
                        <span className="cta-mobile" style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: 'bold' }}>VOIR STATS →</span>
                      </div>
                    </div>
                    
                    <div className="teams-row-mobile" style={teamsRowStyle}>
                      {/* DOMICILE */}
                      <div style={teamBlock}>
                        <div className="club-name-mobile" style={m.status === 'termine' && m.scoreA > m.scoreB ? winClubName : clubTitleStyle}>
                          {m.clubA}
                        </div>
                        <div style={teamSmallStyle}>{m.equipeA}</div>
                      </div>

                      {/* SCORE */}
                      <div className="score-box-mobile" style={scoreBoxStyle}>
                        <span className="score-val-mobile" style={scoreValue}>{m.scoreA ?? 0}</span>
                        <span style={{ color: '#F97316', opacity: 0.5 }}>:</span>
                        <span className="score-val-mobile" style={scoreValue}>{m.scoreB ?? 0}</span>
                      </div>

                      {/* EXTÉRIEUR */}
                      <div style={teamBlock}>
                        <div className="club-name-mobile" style={m.status === 'termine' && m.scoreB > m.scoreA ? winClubName : clubTitleStyle}>
                          {m.clubB}
                        </div>
                        <div style={teamSmallStyle}>{m.equipeB}</div>
                      </div>
                    </div>
                    
                    <div className="footer-detail-mobile" style={footerDetail}>
                      📍 {m.competition} {m.arbitre && ` | ⚖️ ${m.arbitre}`} {m.lieu && ` | 🏢 ${m.lieu}`}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div style={emptyCardStyle}>
            <p>Aucun match enregistré pour le moment.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .match-card {
          transition: all 0.2s ease-in-out;
        }
        .match-card:hover {
          transform: translateY(-3px);
          border-color: #F97316;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .header-mobile { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .title-mobile { font-size: 1.6rem !important; }
          .teams-row-mobile { gap: 5px !important; }
          .club-name-mobile { font-size: 0.85rem !important; }
          .score-box-mobile { padding: 0 10px !important; gap: 5px !important; }
          .score-val-mobile { font-size: 1.6rem !important; }
          .footer-detail-mobile { font-size: 0.7rem !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .cta-mobile { display: none !important; }
          .badges-mobile { gap: 5px !important; flex-wrap: wrap; }
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