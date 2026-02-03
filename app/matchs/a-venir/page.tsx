"use client";
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";

interface EquipeIntern { id: string; nom: string; }
interface Club { id: string; nom: string; equipes: EquipeIntern[]; }
interface Joueur { id: string; numero: string; nom: string; estCoach: boolean; }

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClubA, setSelectedClubA] = useState("");
  const [selectedClubB, setSelectedClubB] = useState("");
  
  // Paramètres du match (Mis à jour pour mi-temps)
  const [dureePeriode, setDureePeriode] = useState("10"); 
  const [tmMT1, setTmMT1] = useState("2");
  const [tmMT2, setTmMT2] = useState("3");

  const [joueursA, setJoueursA] = useState<Joueur[]>([]);
  const [joueursB, setJoueursB] = useState<Joueur[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState<{show: boolean, cote: 'A' | 'B', editIndex: number | null}>({ show: false, cote: 'A', editIndex: null });
  const [tempJoueur, setTempJoueur] = useState({ numero: "", nom: "", estCoach: false });

  const [newMatch, setNewMatch] = useState({
    equipeA: "", clubA: "", equipeB: "", clubB: "",
    date: "", competition: "", arbitre: ""
  });

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = () => {
    const all = (getFromLocal('matchs') || []) as any[];
    setMatchs(all.filter((m: any) => m.status === 'a-venir'));
    setClubs((getFromLocal('equipes_clubs') || []) as Club[]);
    setArbitres((getFromLocal('arbitres') || []) as any[]);
  };

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

  const etape1Valide = () => {
    const check = (list: Joueur[]) => list.filter(j => !j.estCoach).length >= 5 && list.some(j => j.estCoach);
    return check(joueursA) && check(joueursB) && newMatch.equipeA && newMatch.equipeB;
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    const allMatchs = (getFromLocal('matchs') || []) as any[];
    const matchData = {
      ...newMatch,
      clubA: clubs.find(c => c.id === selectedClubA)?.nom,
      clubB: clubs.find(c => c.id === selectedClubB)?.nom,
      joueursA, joueursB,
      status: 'a-venir', scoreA: 0, scoreB: 0,
      config: { 
        tempsInitial: parseInt(dureePeriode) * 60, 
        tmMT1: parseInt(tmMT1),
        tmMT2: parseInt(tmMT2)
      }
    };
    let updated = editingId ? allMatchs.map((m: any) => m.id === editingId ? { ...matchData, id: editingId } : m) : [...allMatchs, { ...matchData, id: Date.now().toString() }];
    saveToLocal('matchs', updated);
    chargerDonnees();
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null); setCurrentStep(1);
    setJoueursA([]); setJoueursB([]);
    setNewMatch({ equipeA: "", clubA: "", equipeB: "", clubB: "", date: "", competition: "", arbitre: "" });
    setSelectedClubA(""); setSelectedClubB("");
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* MODAL JOUEUR */}
      {showPlayerModal.show && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
          <div style={{background:'white', padding:'30px', borderRadius:'15px', width:'320px'}}>
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
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'0.75rem', fontWeight:'900', color:'#64748b'}}>
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
                <div style={{...colStyle, gridColumn: '1/span 2'}}><label style={miniLabel}>DURÉE PÉRIODE (MIN)</label>
                  <select value={dureePeriode} onChange={e => setDureePeriode(e.target.value)} style={inputStyle}>
                    <option value="8">8 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="12">12 minutes</option>
                  </select>
                </div>

                {/* Nouveaux champs Temps-morts */}
                <div style={colStyle}><label style={miniLabel}>TM 1ÈRE MI-TEMPS</label>
                  <select value={tmMT1} onChange={e => setTmMT1(e.target.value)} style={inputStyle}>
                    <option value="1">1 Temps mort</option>
                    <option value="2">2 Temps morts</option>
                  </select>
                </div>
                <div style={colStyle}><label style={miniLabel}>TM 2ÈME MI-TEMPS</label>
                  <select value={tmMT2} onChange={e => setTmMT2(e.target.value)} style={inputStyle}>
                    <option value="1">1 Temps mort</option>
                    <option value="2">2 Temps morts</option>
                    <option value="3">3 Temps morts</option>
                  </select>
                </div>

                <div style={colStyle}><label style={miniLabel}>DATE & HEURE</label>
                  <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} style={inputStyle} />
                </div>
                <div style={colStyle}><label style={miniLabel}>COMPÉTITION</label>
                  <input type="text" placeholder="Ex: Championnat" required value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} style={inputStyle} />
                </div>
                <div style={{...colStyle, gridColumn:'1/span 2'}}><label style={miniLabel}>ARBITRE PRINCIPAL</label>
                  <select required value={newMatch.arbitre} onChange={e => setNewMatch({...newMatch, arbitre: e.target.value})} style={inputStyle}>
                    <option value="">Sélectionner un arbitre...</option>
                    {arbitres.map(a => <option key={a.id} value={a.nom + ' ' + a.prenom}>{a.nom} {a.prenom}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setCurrentStep(1)} style={{...submitBtn, background:'#64748b'}}>← RETOUR</button>
                <button type="submit" style={submitBtn}>{editingId ? "METTRE À JOUR" : "CRÉER LE MATCH"}</button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// TES STYLES CONSERVÉS
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