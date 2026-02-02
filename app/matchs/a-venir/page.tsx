"use client";
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";

interface EquipeIntern { id: string; nom: string; }
interface Club { id: string; nom: string; equipes: EquipeIntern[]; }

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClubA, setSelectedClubA] = useState("");
  const [selectedClubB, setSelectedClubB] = useState("");
  const [dureePeriode, setDureePeriode] = useState("10"); 
  const [tempsMortsMatch, setTempsMortsMatch] = useState("2");

  const [newMatch, setNewMatch] = useState({
    equipeA: "", clubA: "",
    equipeB: "", clubB: "",
    date: "", competition: "", arbitre: ""
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = () => {
    // Cast immédiat en any[] pour éviter toute erreur de filtrage
    const all = (getFromLocal('matchs') || []) as any[];
    setMatchs(all.filter((m: any) => m.status === 'a-venir'));
    setClubs((getFromLocal('equipes_clubs') || []) as Club[]);
    setArbitres((getFromLocal('arbitres') || []) as any[]);
  };

  const equipesDispoA = clubs.find(c => c.id === selectedClubA)?.equipes || [];
  const equipesDispoB = clubs.find(c => c.id === selectedClubB)?.equipes || [];

  const preparerEdition = (m: any) => {
    setEditingId(m.id);
    setNewMatch({
      equipeA: m.equipeA,
      clubA: m.clubA,
      equipeB: m.equipeB,
      clubB: m.clubB,
      date: m.date,
      competition: m.competition,
      arbitre: m.arbitre
    });
    const cA = clubs.find(c => c.nom === m.clubA);
    const cB = clubs.find(c => c.nom === m.clubB);
    setSelectedClubA(cA?.id || "");
    setSelectedClubB(cB?.id || "");
    setDureePeriode((m.config?.tempsInitial / 60).toString());
    setTempsMortsMatch(m.config?.maxTempsMorts.toString());
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    
    // LA CORRECTION CRUCIALE : cast forcé 'as any[]'
    const allMatchs = (getFromLocal('matchs') || []) as any[];

    const matchData = {
      ...newMatch,
      clubA: clubs.find(c => c.id === selectedClubA)?.nom,
      clubB: clubs.find(c => c.id === selectedClubB)?.nom,
      status: 'a-venir',
      scoreA: 0,
      scoreB: 0,
      config: {
        tempsInitial: parseInt(dureePeriode) * 60,
        maxTempsMorts: parseInt(tempsMortsMatch)
      }
    };

    let updated: any[];
    if (editingId) {
      // TypeScript accepte maintenant le .map car allMatchs est casté
      updated = allMatchs.map((m: any) => 
        m.id === editingId ? { ...matchData, id: editingId } : m
      );
    } else {
      updated = [...allMatchs, { ...matchData, id: Date.now().toString() }];
    }
    
    saveToLocal('matchs', updated);
    chargerDonnees();
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewMatch({ equipeA: "", clubA: "", equipeB: "", clubB: "", date: "", competition: "", arbitre: "" });
    setSelectedClubA(""); setSelectedClubB("");
  };

  const supprimerMatch = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce match ?")) {
      const all = (getFromLocal('matchs') || []) as any[];
      const filtered = all.filter((m: any) => m.id !== id);
      saveToLocal('matchs', filtered);
      chargerDonnees();
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>📅 Matchs à venir</h1>
          <p style={{ color: '#666' }}>Planifiez ou modifiez vos rencontres.</p>
        </div>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} style={addBtnStyle}>
          {showForm ? "Annuler" : "+ Programmer un match"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSoumettre} style={{...formCardStyle, border: editingId ? '2px solid #F97316' : '1px solid #e2e8f0'}}>
          <h3 style={{marginTop: 0}}>{editingId ? "✏️ Modifier le match" : "🆕 Nouveau match"}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={colStyle}>
              <label style={miniLabel}>DOMICILE</label>
              <select required value={selectedClubA} onChange={e => {setSelectedClubA(e.target.value); setNewMatch({...newMatch, equipeA: ""})}} style={inputStyle}>
                <option value="">Club...</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select required value={newMatch.equipeA} onChange={e => setNewMatch({...newMatch, equipeA: e.target.value})} style={inputStyle} disabled={!selectedClubA}>
                <option value="">Équipe...</option>
                {equipesDispoA.map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
              </select>
            </div>
            <div style={colStyle}>
              <label style={miniLabel}>EXTÉRIEUR</label>
              <select required value={selectedClubB} onChange={e => {setSelectedClubB(e.target.value); setNewMatch({...newMatch, equipeB: ""})}} style={inputStyle}>
                <option value="">Club...</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select required value={newMatch.equipeB} onChange={e => setNewMatch({...newMatch, equipeB: e.target.value})} style={inputStyle} disabled={!selectedClubB}>
                <option value="">Équipe...</option>
                {equipesDispoB.map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / span 2', background: '#f8fafc', padding: '15px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={colStyle}>
                <label style={miniLabel}>⏱️ DURÉE PÉRIODE (MIN)</label>
                <select value={dureePeriode} onChange={e => setDureePeriode(e.target.value)} style={inputStyle}>
                  <option value="5">5 min</option><option value="7">7 min</option><option value="8">8 min</option><option value="10">10 min</option><option value="12">12 min</option>
                </select>
              </div>
              <div style={colStyle}>
                <label style={miniLabel}>📣 TEMPS MORTS / ÉQUIPE</label>
                <select value={tempsMortsMatch} onChange={e => setTempsMortsMatch(e.target.value)} style={inputStyle}>
                  <option value="1">1 TM</option><option value="2">2 TM</option><option value="3">3 TM</option>
                </select>
              </div>
            </div>
            <div style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="Compétition" required value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} style={inputStyle} />
              <select required value={newMatch.arbitre} onChange={e => setNewMatch({...newMatch, arbitre: e.target.value})} style={{...inputStyle, gridColumn: '1 / span 2'}}>
                <option value="">Choisir l'arbitre</option>
                {arbitres.map(arb => <option key={arb.id} value={arb.nom + ' ' + arb.prenom}>{arb.nom} {arb.prenom}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" style={submitBtn}>
            {editingId ? "METTRE À JOUR LE MATCH" : "CRÉER LE MATCH CONFIGURÉ"}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {matchs.map((m) => (
          <div key={m.id} style={matchCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={clubSmall}>{m.clubA}</span>
                <span style={{ fontWeight: '800' }}>{m.equipeA}</span>
              </div>
              <div style={{ padding: '0 20px', fontWeight: '900', color: '#F97316' }}>VS</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={clubSmall}>{m.clubB}</span>
                <span style={{ fontWeight: '800' }}>{m.equipeB}</span>
              </div>
            </div>
            <div style={footerCard}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#F97316', fontWeight: 'bold' }}>📅 {m.date?.replace('T', ' à ')}</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>📏 {m.config?.tempsInitial / 60} min | TM: {m.config?.maxTempsMorts}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => preparerEdition(m)} style={editBtnStyle}>Modifier ✏️</button>
                <button onClick={() => supprimerMatch(m.id)} style={deleteBtnStyle}>🗑️</button>
                <Link href={`/matchs/${m.id}`} style={tableBtn}>Démarrer ⏱️</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// STYLES AVEC TYPAGE FORCÉ (as const)
const editBtnStyle = { background: 'none', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' } as const;
const deleteBtnStyle = { background: '#fee2e2', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' } as const;
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white' } as const;
const colStyle = { display: 'flex', flexDirection: 'column', gap: '5px' } as const; // <-- C'était lui le coupable
const miniLabel = { fontSize: '0.65rem', fontWeight: '900', color: '#64748b', letterSpacing: '0.05em' } as const;
const addBtnStyle = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' } as const;
const submitBtn = { width: '100%', marginTop: '20px', backgroundColor: '#1a1a1a', color: 'white', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', border: 'none' } as const;
const matchCardStyle = { padding: '20px', border: '1px solid #f1f1f1', borderRadius: '12px', background: 'white' } as const;
const formCardStyle = { marginBottom: '30px', padding: '25px', borderRadius: '16px', backgroundColor: '#fff' } as const;
const clubSmall = { display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' as const, fontWeight: 'bold' } as const;
const footerCard = { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as const;
const tableBtn = { color: '#F97316', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #F97316', padding: '6px 12px', borderRadius: '6px' } as const;