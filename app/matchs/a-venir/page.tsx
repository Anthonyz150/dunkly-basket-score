"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ton client Supabase
import Link from "next/link";

interface EquipeIntern { id: string; nom: string; }
interface Club { id: string; nom: string; equipes: EquipeIntern[]; }
interface Joueur { id: string; numero: string; nom: string; estCoach: boolean; }
interface Competition { id: string; nom: string; }

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedClubA, setSelectedClubA] = useState("");
  const [selectedClubB, setSelectedClubB] = useState("");
  const [dureePeriode, setDureePeriode] = useState("10"); 
  const [tmMT1, setTmMT1] = useState("2");
  const [tmMT2, setTmMT2] = useState("3");

  const [joueursA, setJoueursA] = useState<Joueur[]>([]);
  const [joueursB, setJoueursB] = useState<Joueur[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState<{show: boolean, cote: 'A' | 'B', editIndex: number | null}>({ show: false, cote: 'A', editIndex: null });
  const [tempJoueur, setTempJoueur] = useState({ numero: "", nom: "", estCoach: false });

  const [newMatch, setNewMatch] = useState({
    equipeA: "", clubA: "", equipeB: "", clubB: "",
    date: "", competition: "", arbitre: "", lieu: "" 
  });

  // --- CHARGEMENT DEPUIS LE BACKEND (SUPABASE) ---
  useEffect(() => { 
    chargerDonnees(); 
  }, []);

  const chargerDonnees = async () => {
    // Récupération des matchs à venir
    const { data: listMatchs } = await supabase
      .from('matchs')
      .select('*')
      .eq('status', 'a-venir')
      .order('date', { ascending: true });
    
    if (listMatchs) setMatchs(listMatchs);

    // Récupération des tables de référence (Clubs, Arbitres, etc.)
    const { data: listClubs } = await supabase.from('equipes_clubs').select('*');
    const { data: listArb } = await supabase.from('arbitres').select('*');
    const { data: listComp } = await supabase.from('competitions').select('*');

    if (listClubs) setClubs(listClubs);
    if (listArb) setArbitres(listArb);
    if (listComp) setCompetitions(listComp);
  };

  // --- LOGIQUE JOUEURS ---
  const trierEffectif = (liste: Joueur[]) => {
    return [...liste].sort((a, b) => {
      if (a.estCoach) return 1;
      if (b.estCoach) return -1;
      return parseInt(a.numero) - parseInt(b.numero);
    });
  };

  const ouvrirModalJoueur = (cote: 'A' | 'B', index: number | null = null) => {
    if (index !== null) {
      const j = cote === 'A' ? joueursA[index] : joueursB[index];
      setTempJoueur({ numero: j.numero, nom: j.nom, estCoach: j.estCoach });
      setShowPlayerModal({ show: true, cote, editIndex: index });
    } else {
      setTempJoueur({ numero: "", nom: "", estCoach: false });
      setShowPlayerModal({ show: true, cote, editIndex: null });
    }
  };

  const validerAjoutJoueur = () => {
    if (!tempJoueur.nom) return;
    const nouveau = { ...tempJoueur, id: Date.now().toString() };
    if (showPlayerModal.cote === 'A') {
      let liste = [...joueursA];
      if (showPlayerModal.editIndex !== null) liste[showPlayerModal.editIndex] = nouveau;
      else liste.push(nouveau);
      setJoueursA(trierEffectif(liste));
    } else {
      let liste = [...joueursB];
      if (showPlayerModal.editIndex !== null) liste[showPlayerModal.editIndex] = nouveau;
      else liste.push(nouveau);
      setJoueursB(trierEffectif(liste));
    }
    setShowPlayerModal({ show: false, cote: 'A', editIndex: null });
  };

  // --- SOUMISSION AU BACKEND ---
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
      joueursA, 
      joueursB,
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
      const { error } = await supabase.from('matchs').update(matchData).eq('id', editingId);
      if (error) alert("Erreur MAJ: " + error.message);
    } else {
      const { error } = await supabase.from('matchs').insert([matchData]);
      if (error) alert("Erreur Création: " + error.message);
    }
    
    chargerDonnees();
    resetForm();
  };

  const supprimerMatch = async (id: string) => {
    if (confirm("Supprimer ce match pour TOUT LE SITE ?")) {
      const { error } = await supabase.from('matchs').delete().eq('id', id);
      if (!error) chargerDonnees();
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

    setJoueursA(m.joueursA || []);
    setJoueursB(m.joueursB || []);
    
    if (m.config) {
      setDureePeriode((m.config.tempsInitial / 60).toString());
      setTmMT1(m.config.tmMT1.toString());
      setTmMT2(m.config.tmMT2.toString());
    }

    setShowForm(true);
    setCurrentStep(1);
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null); setCurrentStep(1);
    setJoueursA([]); setJoueursB([]);
    setNewMatch({ equipeA: "", clubA: "", equipeB: "", clubB: "", date: "", competition: "", arbitre: "", lieu: "" });
    setSelectedClubA(""); setSelectedClubB("");
  };

  const etape1Valide = () => {
    const check = (list: Joueur[]) => list.filter(j => !j.estCoach).length >= 5 && list.some(j => j.estCoach);
    return check(joueursA) && check(joueursB) && newMatch.equipeA && newMatch.equipeB;
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* MODAL JOUEUR */}
      {showPlayerModal.show && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{marginTop:0}}>Effectif</h3>
            <label style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'15px', fontSize:'0.9rem'}}>
              <input type="checkbox" checked={tempJoueur.estCoach} onChange={e => setTempJoueur({...tempJoueur, estCoach: e.target.checked, numero: e.target.checked ? "COACH" : ""})} /> Est le Coach ?
            </label>
            {!tempJoueur.estCoach && <input type="number" placeholder="Numéro" value={tempJoueur.numero} onChange={e => setTempJoueur({...tempJoueur, numero: e.target.value})} style={inputStyle} />}
            <input type="text" placeholder="Nom complet" value={tempJoueur.nom} onChange={e => setTempJoueur({...tempJoueur, nom: e.target.value})} style={inputStyle} />
            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              <button onClick={() => setShowPlayerModal({show:false, cote:'A', editIndex:null})} style={{...inputStyle, background:'#eee'}}>Annuler</button>
              <button onClick={validerAjoutJoueur} style={{...submitBtn, marginTop:0}}>Valider</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>📅 Matchs à venir</h1>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} style={addBtnStyle}>{showForm ? "Annuler" : "+ Match"}</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={{color: currentStep === 1 ? '#F97316' : '#ccc'}}>1. ÉQUIPES & JOUEURS</span>
            <span style={{color: currentStep === 2 ? '#F97316' : '#ccc'}}>2. CONFIGURATION</span>
          </div>

          <form onSubmit={handleSoumettre}>
            {currentStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[ {side:'A', sel:selectedClubA, setSel:setSelectedClubA, eq:newMatch.equipeA, setEq:(v:string)=>setNewMatch({...newMatch, equipeA:v}), j:joueursA, label:'DOMICILE'},
                    {side:'B', sel:selectedClubB, setSel:setSelectedClubB, eq:newMatch.equipeB, setEq:(v:string)=>setNewMatch({...newMatch, equipeB:v}), j:joueursB, label:'EXTÉRIEUR'}
                ].map((item, idx) => (
                  <div key={idx} style={colStyle}>
                    <label style={miniLabel}>{item.label}</label>
                    <select required value={item.sel} onChange={e => {item.setSel(e.target.value); item.setEq("")}} style={inputStyle}>
                      <option value="">Club...</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <select required value={item.eq} onChange={e => item.setEq(e.target.value)} style={inputStyle} disabled={!item.sel}>
                      <option value="">Équipe...</option>
                      {(clubs.find(c => c.id === item.sel)?.equipes || []).map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
                    </select>
                    <button type="button" onClick={() => ouvrirModalJoueur(item.side as 'A'|'B')} style={addPlayerBtnStyle}>+ Ajouter Joueur/Coach</button>
                    <div style={playerListContainer}>
                      {item.j.map((j,i) => (
                        <div key={i} style={playerRowStyle}>
                          <span>{j.estCoach ? '👔 Coach' : '#'+j.numero} {j.nom}</span>
                          <button type="button" onClick={() => ouvrirModalJoueur(item.side as 'A'|'B', i)} style={miniEditBtn}>✎</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{gridColumn:'1/span 2'}}>
                  <button type="button" onClick={() => setCurrentStep(2)} disabled={!etape1Valide()} style={{...submitBtn, opacity: etape1Valide() ? 1 : 0.4}}>SUIVANT →</button>
                  {!etape1Valide() && <p style={errorTextStyle}>Requis : 5 joueurs + 1 coach par équipe</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={colStyle}><label style={miniLabel}>DURÉE PÉRIODE (MIN)</label>
                  <select value={dureePeriode} onChange={e => setDureePeriode(e.target.value)} style={inputStyle}>
                    <option value="8">8 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="12">12 minutes</option>
                  </select>
                </div>
                <div style={colStyle}><label style={miniLabel}>DATE & HEURE</label>
                  <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} style={inputStyle} />
                </div>
                <div style={colStyle}><label style={miniLabel}>TM 1ÈRE MI-TEMPS</label>
                  <select value={tmMT1} onChange={e => setTmMT1(e.target.value)} style={inputStyle}>
                    <option value="1">1 TM</option>
                    <option value="2">2 TM</option>
                  </select>
                </div>
                <div style={colStyle}><label style={miniLabel}>TM 2ÈME MI-TEMPS</label>
                  <select value={tmMT2} onChange={e => setTmMT2(e.target.value)} style={inputStyle}>
                    <option value="1">1 TM</option>
                    <option value="2">2 TM</option>
                    <option value="3">3 TM</option>
                  </select>
                </div>
                <div style={colStyle}><label style={miniLabel}>COMPÉTITION</label>
                  <select required value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    {competitions.map(comp => <option key={comp.id} value={comp.nom}>{comp.nom}</option>)}
                  </select>
                </div>
                <div style={colStyle}><label style={miniLabel}>ARBITRE PRINCIPAL</label>
                  <select required value={newMatch.arbitre} onChange={e => setNewMatch({...newMatch, arbitre: e.target.value})} style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    {arbitres.map(a => <option key={a.id} value={a.nom + ' ' + a.prenom}>{a.nom} {a.prenom}</option>)}
                  </select>
                </div>
                <div style={{...colStyle, gridColumn: '1/span 2'}}>
                  <label style={miniLabel}>📍 LIEU DU MATCH / ADRESSE</label>
                  <input type="text" placeholder="Ex: Gymnase Herzog, Cagnes-sur-Mer" value={newMatch.lieu} onChange={e => setNewMatch({...newMatch, lieu: e.target.value})} style={inputStyle} />
                </div>
                <button type="button" onClick={() => setCurrentStep(1)} style={{...submitBtn, background:'#64748b'}}>← RETOUR</button>
                <button type="submit" style={submitBtn}>{editingId ? "METTRE À JOUR" : "CRÉER LE MATCH"}</button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* LISTE DES MATCHS RÉCUPÉRÉS DE SUPABASE */}
      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
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
                <div>📅 {m.date ? m.date.replace('T', ' ') : 'Non définie'} | {m.competition}</div>
                {m.lieu && (
                  <div style={{ marginTop: '5px' }}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.lieu)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      📍 {m.lieu} ↗
                    </a>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => supprimerMatch(m.id)} style={iconBtn}>🗑️</button>
                <button onClick={() => handleEditer(m)} style={editBtnSmall}>ÉDITER ✎</button>
                <Link href={`/matchs/marque/${m.id}`} style={startBtnStyle}>DÉMARRER</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- STYLES (Conservés et nettoyés) ---
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '100%', boxSizing: 'border-box' as const };
const addBtnStyle = { backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer' };
const submitBtn = { width: '100%', backgroundColor: '#1a1a1a', color: 'white', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' as const, border: 'none' };
const formCardStyle = { marginBottom: '30px', padding: '25px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #eee' };
const colStyle = { display: 'flex', flexDirection: 'column' as const, gap: '5px' };
const miniLabel = { fontSize: '0.65rem', fontWeight: '900' as const, color: '#64748b', letterSpacing: '0.05em', marginBottom: '5px' };
const addPlayerBtnStyle = { ...inputStyle, background:'none', border:'1px dashed #F97316', color:'#F97316', fontWeight:'bold', cursor: 'pointer', marginTop:'10px' };
const playerListContainer = { background:'#f8fafc', padding:'10px', borderRadius:'8px', minHeight:'60px', marginTop:'10px' };
const playerRowStyle = { display:'flex', justifyContent:'space-between', fontSize:'0.8rem', padding:'4px 0', borderBottom: '1px solid #f1f5f9' };
const miniEditBtn = { border:'none', background:'none', color:'#F97316', cursor:'pointer' };
const errorTextStyle = { fontSize:'0.7rem', color:'red', textAlign:'center' as const, marginTop:'10px' };
const matchCardStyle = { padding: '20px', border: '1px solid #f1f1f1', borderRadius: '12px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' };
const clubSmall = { display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' as const, fontWeight: 'bold' as const };
const footerCard = { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const startBtnStyle = { backgroundColor: '#F97316', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' };
const overlayStyle = {position:'fixed' as const, top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000};
const modalContentStyle = {background:'white', padding:'30px', borderRadius:'15px', width:'320px'};
const stepHeaderStyle = {display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'0.75rem', fontWeight:'900', color:'#64748b'};
const iconBtn = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' };
const editBtnSmall = { border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold' as const, fontSize: '0.75rem' };