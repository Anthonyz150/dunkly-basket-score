'use client';
import { useState, useEffect } from 'react';
import { saveToLocal, getFromLocal } from '@/lib/store';
import Link from 'next/link';

interface Match {
  id: string;
  competition: string;
  equipeA: string;
  equipeB: string;
  scoreA: number;
  scoreB: number;
  arbitre: string;
  date: string;
  status?: string;
}

export default function MatchsPage() {
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [compets, setCompets] = useState<any[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    competition: '', equipeA: '', equipeB: '', scoreA: 0, scoreB: 0, arbitre: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    setMatchs(getFromLocal('matchs') || []);
    setEquipes(getFromLocal('equipes') || []);
    setCompets(getFromLocal('competitions') || []);
    setArbitres(getFromLocal('arbitres') || []);
  }, []);

  // PROTECTION : Seul 'admin' a les droits d'écriture
  const isAdmin = user?.username === 'admin';

  const enregistrerMatch = () => {
    if (!isAdmin) return; // Sécurité bloquante
    if (!form.equipeA || !form.equipeB || !form.competition) {
      return alert("Veuillez sélectionner au moins les équipes et la compétition !");
    }
    if (form.equipeA === form.equipeB) {
      return alert("Une équipe ne peut pas jouer contre elle-même !");
    }

    const nouveauMatch: Match = {
      ...form,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'termine'
    };

    const nouvelleListe = [nouveauMatch, ...matchs];
    setMatchs(nouvelleListe);
    saveToLocal('matchs', nouvelleListe);
    
    setIsModalOpen(false);
    setForm({ competition: '', equipeA: '', equipeB: '', scoreA: 0, scoreB: 0, arbitre: '' });
  };

  const supprimerMatch = (id: string) => {
    if (!isAdmin) return; // Sécurité bloquante
    if (confirm("Voulez-vous vraiment supprimer ce résultat ?")) {
      const nouvelleListe = matchs.filter(m => m.id !== id);
      setMatchs(nouvelleListe);
      saveToLocal('matchs', nouvelleListe);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>⏱️</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>Matchs & Résultats</h1>
        </div>
        
        {/* Le bouton "Nouveau Match" ne s'affiche plus pour Anthony */}
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} style={btnAjouterStyle}>
            + Nouveau Match
          </button>
        )}
      </header>

      {/* MODALE D'AJOUT SÉCURISÉE */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalContentStyle}>
            <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Enregistrer un Match</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={labelStyle}>Compétition</label>
              <select style={inputStyle} value={form.competition} onChange={e => setForm({...form, competition: e.target.value})}>
                <option value="">-- Choisir le tournoi --</option>
                {compets.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Équipe A</label>
                  <select style={inputStyle} value={form.equipeA} onChange={e => setForm({...form, equipeA: e.target.value})}>
                    <option value="">Sélectionner</option>
                    {equipes.map(e => <option key={e.id} value={e.nom}>{e.nom}</option>)}
                  </select>
                  <input type="number" placeholder="Score A" style={{...inputStyle, marginTop: '8px'}} value={form.scoreA} onChange={e => setForm({...form, scoreA: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Équipe B</label>
                  <select style={inputStyle} value={form.equipeB} onChange={e => setForm({...form, equipeB: e.target.value})}>
                    <option value="">Sélectionner</option>
                    {equipes.map(e => <option key={e.id} value={e.nom}>{e.nom}</option>)}
                  </select>
                  <input type="number" placeholder="Score B" style={{...inputStyle, marginTop: '8px'}} value={form.scoreB} onChange={e => setForm({...form, scoreB: Number(e.target.value)})} />
                </div>
              </div>

              <label style={labelStyle}>Arbitre Officiel</label>
              <select style={inputStyle} value={form.arbitre} onChange={e => setForm({...form, arbitre: e.target.value})}>
                <option value="">-- Aucun arbitre --</option>
                {arbitres.map((a) => <option key={a.id} value={a.nom}>{a.nom}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={enregistrerMatch} style={{ ...actionBtnStyle, background: 'var(--orange-basket)', flex: 1 }}>Valider</button>
                <button onClick={() => setIsModalOpen(false)} style={{ ...actionBtnStyle, background: '#666', flex: 1 }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {matchs.length > 0 ? (
          matchs.map((m) => (
            <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '0.7rem', background: '#fff5eb', color: 'var(--orange-basket)', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
                    {m.competition}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>📅 {m.date}</span>
                </div>
                
                <div style={{ fontSize: '1.6rem', fontWeight: '800', margin: '15px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ minWidth: '150px', textAlign: 'right' }}>{m.equipeA}</span>
                  <span style={scoreBadgeStyle}>{m.scoreA}</span>
                  <span style={{ color: '#ccc' }}>-</span>
                  <span style={scoreBadgeStyle}>{m.scoreB}</span>
                  <span style={{ minWidth: '150px', textAlign: 'left' }}>{m.equipeB}</span>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#777', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span>🏁 Arbitre : <strong>{m.arbitre || 'Non assigné'}</strong></span>
                </div>
                
                {/* Anthony ne voit plus le bouton de lancement e-marque */}
                {isAdmin && (
                  <Link href={`/matchs/${m.id}`}>
                    <button style={btnEMarqueStyle}>Lancer l'e-marque ⏱️</button>
                  </Link>
                )}
              </div>

              {/* Anthony ne voit plus le bouton de suppression */}
              {isAdmin && (
                <button onClick={() => supprimerMatch(m.id)} style={btnSupprimerStyle}>🗑️</button>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p style={{ fontSize: '1.2rem' }}>Aucun match enregistré.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES (Conservés à l'identique)
const btnAjouterStyle = { background: '#1a1a1a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '30px', borderRadius: '15px', width: '500px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' as const };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', outline: 'none' };
const actionBtnStyle = { color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const scoreBadgeStyle = { background: '#1a1a1a', padding: '8px 16px', borderRadius: '8px', margin: '0 15px', color: 'white', minWidth: '50px', textAlign: 'center' as const };
const btnSupprimerStyle = { background: '#fff0f0', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem', padding: '12px', borderRadius: '8px' };
const btnEMarqueStyle = { marginTop: '20px', background: 'none', color: '#1a1a1a', border: '2px solid #1a1a1a', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' };