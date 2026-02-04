'use client';

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function ResultatsPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);

  // État pour le formulaire d'ajout
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMatch, setNewMatch] = useState({
    clubA: '', clubB: '', equipeA: '', equipeB: '', 
    competition: '', date: '', lieu: '', status: 'a-venir'
  });

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

  const ajouterMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('matchs').insert([newMatch]);
    if (error) alert(error.message);
    else {
      setShowAddForm(false);
      chargerTousLesMatchs();
      setNewMatch({ clubA: '', clubB: '', equipeA: '', equipeB: '', competition: '', date: '', lieu: '', status: 'a-venir' });
    }
  };

  const filteredMatchs = useMemo(() => {
    return matchs.filter(m => 
      m.clubA?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.clubB?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [matchs, searchTerm]);

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Résultats <span className="orange-dot">.</span></h1>
          <p className="subtitle">Gestion et suivi des rencontres</p>
        </div>
        <div className="header-right">
          {isAdmin && (
            <button className="admin-toggle-btn" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Fermer" : "+ Nouveau Match"}
            </button>
          )}
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* SECTION RÉSERVÉE AUX ADMINS */}
      {isAdmin && showAddForm && (
        <section className="admin-panel">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Planifier un match</h3>
              <p>Remplissez les informations pour le calendrier</p>
            </div>
            <form onSubmit={ajouterMatch} className="admin-form">
              <div className="form-grid">
                <input type="text" placeholder="Club Domicile" required value={newMatch.clubA} onChange={e => setNewMatch({...newMatch, clubA: e.target.value})} />
                <input type="text" placeholder="Club Extérieur" required value={newMatch.clubB} onChange={e => setNewMatch({...newMatch, clubB: e.target.value})} />
                <input type="text" placeholder="Catégorie (ex: U15-1)" value={newMatch.equipeA} onChange={e => setNewMatch({...newMatch, equipeA: e.target.value})} />
                <input type="text" placeholder="Catégorie (ex: U15-2)" value={newMatch.equipeB} onChange={e => setNewMatch({...newMatch, equipeB: e.target.value})} />
                <input type="text" placeholder="Compétition" value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} />
                <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} />
                <input type="text" placeholder="Lieu" className="full-width" value={newMatch.lieu} onChange={e => setNewMatch({...newMatch, lieu: e.target.value})} />
              </div>
              <button type="submit" className="submit-btn">Enregistrer le match</button>
            </form>
          </div>
        </section>
      )}

      {/* LISTE DES MATCHS (Même style qu'avant) */}
      <div className="matchs-grid">
        {filteredMatchs.map((m) => (
          <Link href={`/matchs/resultats/${m.id}`} key={m.id} className="match-card-link">
            <div className="match-card">
              <div className={`side-accent ${m.status === 'en-cours' ? 'live' : 'finished'}`}></div>
              <div className="card-main">
                <div className="card-info-top">
                  <span className="badge-comp">🏆 {m.competition}</span>
                  <span className="match-date">{m.date?.replace('T', ' à ')}</span>
                </div>
                <div className="scoreboard-container">
                  <div className="team-block home"><span className="team-name">{m.clubA}</span></div>
                  <div className="score-pill">
                    <span className="score-val">{m.scoreA ?? 0}</span>
                    <span className="score-divider">:</span>
                    <span className="score-val">{m.scoreB ?? 0}</span>
                  </div>
                  <div className="team-block away"><span className="team-name">{m.clubB}</span></div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .page-container { padding: 10px; animation: fadeIn 0.4s ease; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .orange-dot { color: #f97316; }
        
        .header-right { display: flex; gap: 15px; }
        .admin-toggle-btn { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; }
        .admin-toggle-btn:hover { background: #f97316; }

        /* ADMIN PANEL */
        .admin-panel { margin-bottom: 40px; animation: slideDown 0.3s ease-out; }
        .admin-card { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .admin-card-header { margin-bottom: 20px; }
        .admin-card-header h3 { margin: 0; color: #0f172a; font-size: 1.2rem; }
        .admin-card-header p { margin: 5px 0 0; color: #64748b; font-size: 0.85rem; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .full-width { grid-column: span 2; }
        .admin-form input { padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-size: 0.9rem; }
        .admin-form input:focus { border-color: #f97316; }
        .submit-btn { background: #f97316; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.2s; }
        .submit-btn:hover { background: #0f172a; }

        .matchs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .match-card { background: white; border-radius: 16px; display: flex; height: 160px; border: 1px solid #f1f5f9; transition: 0.2s; }
        .side-accent { width: 6px; }
        .side-accent.finished { background: #0f172a; }
        .side-accent.live { background: #22c55e; }
        .card-main { flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .score-pill { background: #0f172a; color: white; padding: 5px 15px; border-radius: 10px; display: flex; gap: 8px; align-items: center; }
        .score-val { font-size: 1.4rem; font-weight: 900; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
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