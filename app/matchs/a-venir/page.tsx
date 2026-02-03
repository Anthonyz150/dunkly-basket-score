"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface EquipeIntern { id: string; nom: string; }
interface Club { id: string; nom: string; equipes: EquipeIntern[]; }
interface Competition { id: string; nom: string; }

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedClubA, setSelectedClubA] = useState("");
  const [selectedClubB, setSelectedClubB] = useState("");
  const [dureePeriode, setDureePeriode] = useState("10"); 
  const [tmMT1, setTmMT1] = useState("2");
  const [tmMT2, setTmMT2] = useState("3");

  const [newMatch, setNewMatch] = useState({
    equipeA: "", clubA: "", equipeB: "", clubB: "",
    date: "", competition: "", arbitre: "", lieu: "" 
  });

  useEffect(() => { 
    chargerDonnees(); 
  }, []);

  const chargerDonnees = async () => {
    const { data: listMatchs } = await supabase
      .from('matchs')
      .select('*')
      .eq('status', 'a-venir')
      .order('date', { ascending: true });
    
    if (listMatchs) setMatchs(listMatchs);

    const { data: listClubs } = await supabase.from('equipes_clubs').select('*');
    // On récupère les arbitres depuis la table profiles (mis à jour via ton script SQL)
    const { data: listArb } = await supabase.from('profiles').select('*').eq('role', 'arbitre');
    const { data: listComp } = await supabase.from('competitions').select('*');

    if (listClubs) setClubs(listClubs);
    if (listArb) setArbitres(listArb);
    if (listComp) setCompetitions(listComp);
  };

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const matchData = {
      clubA: clubs.find(c => c.id === selectedClubA)?.nom,
      equipeA: newMatch.equipeA,
      clubB: clubs.find(c => c.id === selectedClubB)?.nom,
      equipeB: newMatch.equipeB,
      date: newMatch.date,
      competition: newMatch.competition,
      arbitre: newMatch.arbitre,
      lieu: newMatch.lieu,
      status: 'a-venir', 
      scoreA: 0, 
      scoreB: 0,
      config: { 
        tempsInitial: parseInt(dureePeriode) * 60, 
        tmMT1: parseInt(tmMT1),
        tmMT2: parseInt(tmMT2)
      }
    };

    if (editingId) {
      await supabase.from('matchs').update(matchData).eq('id', editingId);
    } else {
      await supabase.from('matchs').insert([matchData]);
    }
    
    chargerDonnees();
    resetForm();
  };

  const supprimerMatch = async (id: string) => {
    if (confirm("Supprimer ce match ?")) {
      await supabase.from('matchs').delete().eq('id', id);
      chargerDonnees();
    }
  };

  const handleEditer = (m: any) => {
    setEditingId(m.id);
    setNewMatch({
      equipeA: m.equipeA, clubA: m.clubA, equipeB: m.equipeB, clubB: m.clubB,
      date: m.date, competition: m.competition, arbitre: m.arbitre, lieu: m.lieu || ""
    });
    
    const clubAObj = clubs.find(c => c.nom === m.clubA);
    const clubBObj = clubs.find(c => c.nom === m.clubB);
    if (clubAObj) setSelectedClubA(clubAObj.id);
    if (clubBObj) setSelectedClubB(clubBObj.id);

    if (m.config) {
      setDureePeriode((m.config.tempsInitial / 60).toString());
      setTmMT1(m.config.tmMT1.toString());
      setTmMT2(m.config.tmMT2.toString());
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setNewMatch({ equipeA: "", clubA: "", equipeB: "", clubB: "", date: "", competition: "", arbitre: "", lieu: "" });
    setSelectedClubA(""); setSelectedClubB("");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>📅 Matchs à venir</h1>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} style={addBtnStyle}>
          {showForm ? "Annuler" : "+ Créer un Match"}
        </button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <form onSubmit={handleSoumettre} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* DOMICILE */}
            <div style={colStyle}>
              <label style={miniLabel}>ÉQUIPE DOMICILE</label>
              <select required value={selectedClubA} onChange={e => setSelectedClubA(e.target.value)} style={inputStyle}>
                <option value="">Choisir Club...</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select required value={newMatch.equipeA} onChange={e => setNewMatch({...newMatch, equipeA: e.target.value})} style={inputStyle} disabled={!selectedClubA}>
                <option value="">Choisir Équipe...</option>
                {(clubs.find(c => c.id === selectedClubA)?.equipes || []).map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
              </select>
            </div>

            {/* EXTÉRIEUR */}
            <div style={colStyle}>
              <label style={miniLabel}>ÉQUIPE EXTÉRIEUR</label>
              <select required value={selectedClubB} onChange={e => setSelectedClubB(e.target.value)} style={inputStyle}>
                <option value="">Choisir Club...</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <select required value={newMatch.equipeB} onChange={e => setNewMatch({...newMatch, equipeB: e.target.value})} style={inputStyle} disabled={!selectedClubB}>
                <option value="">Choisir Équipe...</option>
                {(clubs.find(c => c.id === selectedClubB)?.equipes || []).map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
              </select>
            </div>

            <div style={colStyle}>
              <label style={miniLabel}>DURÉE PÉRIODE (MIN)</label>
              <select value={dureePeriode} onChange={e => setDureePeriode(e.target.value)} style={inputStyle}>
                <option value="8">8 minutes</option>
                <option value="10">10 minutes</option>
                <option value="12">12 minutes</option>
              </select>
            </div>

            <div style={colStyle}>
              <label style={miniLabel}>DATE & HEURE</label>
              <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} style={inputStyle} />
            </div>

            <div style={colStyle}>
              <label style={miniLabel}>COMPÉTITION</label>
              <select required value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} style={inputStyle}>
                <option value="">Sélectionner...</option>
                {competitions.map(comp => <option key={comp.id} value={comp.nom}>{comp.nom}</option>)}
              </select>
            </div>

            <div style={colStyle}>
              <label style={miniLabel}>ARBITRE</label>
              <select required value={newMatch.arbitre} onChange={e => setNewMatch({...newMatch, arbitre: e.target.value})} style={inputStyle}>
                <option value="">Sélectionner...</option>
                {arbitres.map(a => <option key={a.id} value={`${a.prenom} ${a.nom}`}>{a.prenom} {a.nom}</option>)}
              </select>
            </div>

            <div style={{...colStyle, gridColumn: '1/span 2'}}>
              <label style={miniLabel}>📍 LIEU / GYMNASE</label>
              <input type="text" placeholder="Ex: Gymnase Herzog" value={newMatch.lieu} onChange={e => setNewMatch({...newMatch, lieu: e.target.value})} style={inputStyle} />
            </div>

            <button type="submit" style={submitBtn}>{editingId ? "METTRE À JOUR" : "CRÉER LE MATCH"}</button>
          </form>
        </div>
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
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <div>📅 {m.date?.replace('T', ' ')} | {m.competition}</div>
                {m.lieu && <div style={{color:'#F97316', fontSize:'0.7rem', marginTop:4}}>📍 {m.lieu}</div>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => supprimerMatch(m.id)} style={iconBtn}>🗑️</button>
                <button onClick={() => handleEditer(m)} style={editBtnSmall}>✎</button>
                <Link href={`/matchs/marque/${m.id}`} style={startBtnStyle}>MARQUER</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
const addBtnStyle = { backgroundColor: '#111827', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer' };
const submitBtn = { gridColumn: '1/span 2', backgroundColor: '#F97316', color: 'white', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' as const, border: 'none' };
const formCardStyle = { marginBottom: '30px', padding: '20px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #eee' };
const colStyle = { display: 'flex', flexDirection: 'column' as const, gap: '5px' };
const miniLabel = { fontSize: '0.65rem', fontWeight: '900' as const, color: '#64748b', marginBottom: '2px' };
const matchCardStyle = { padding: '20px', border: '1px solid #f1f1f1', borderRadius: '12px', background: 'white' };
const clubSmall = { display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' as const };
const footerCard = { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const startBtnStyle = { backgroundColor: '#F97316', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' };
const iconBtn = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' };
const editBtnSmall = { border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold' as const, fontSize: '0.75rem' };