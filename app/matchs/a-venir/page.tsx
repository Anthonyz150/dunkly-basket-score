"use client";
import { useState, useEffect } from "react";
import { getFromLocal, saveToLocal } from "@/lib/store";
import Link from "next/link";

export default function MatchsAVenirPage() {
  const [matchs, setMatchs] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [arbitres, setArbitres] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [newMatch, setNewMatch] = useState({
    equipeA: "", equipeB: "", date: "", competition: "", arbitre: ""
  });

  useEffect(() => {
    // Chargement des matchs
    const dataMatchs = getFromLocal('matchs') || [];
    setMatchs(dataMatchs.filter((m: any) => m.status === 'a-venir'));

    // Chargement des équipes et arbitres existants
    setEquipes(getFromLocal('equipes') || []);
    setArbitres(getFromLocal('arbitres') || []);
  }, []);

  const ajouterMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMatch.equipeA === newMatch.equipeB) {
      alert("Une équipe ne peut pas jouer contre elle-même !");
      return;
    }

    const allMatchs = getFromLocal('matchs') || [];
    const createdMatch = {
      ...newMatch,
      id: Date.now().toString(),
      status: 'a-venir',
      scoreA: 0,
      scoreB: 0
    };
    
    const updated = [...allMatchs, createdMatch];
    saveToLocal('matchs', updated);
    setMatchs(updated.filter((m: any) => m.status === 'a-venir'));
    setShowForm(false);
    setNewMatch({ equipeA: "", equipeB: "", date: "", competition: "", arbitre: "" });
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>📅 Matchs à venir</h1>
          <p style={{ color: '#666' }}>Utilisez vos équipes et arbitres enregistrés.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#F97316', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {showForm ? "Annuler" : "+ Programmer un match"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={ajouterMatch} className="card" style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          {/* Sélection Équipe A */}
          <select required value={newMatch.equipeA} onChange={e => setNewMatch({...newMatch, equipeA: e.target.value})} style={inputStyle}>
            <option value="">Sélectionner Équipe A</option>
            {equipes.map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
          </select>

          {/* Sélection Équipe B */}
          <select required value={newMatch.equipeB} onChange={e => setNewMatch({...newMatch, equipeB: e.target.value})} style={inputStyle}>
            <option value="">Sélectionner Équipe B</option>
            {equipes.map(eq => <option key={eq.id} value={eq.nom}>{eq.nom}</option>)}
          </select>

          <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} style={inputStyle} />
          <input type="text" placeholder="Nom de la Compétition" required value={newMatch.competition} onChange={e => setNewMatch({...newMatch, competition: e.target.value})} style={inputStyle} />

          {/* Sélection Arbitre */}
          <select required value={newMatch.arbitre} onChange={e => setNewMatch({...newMatch, arbitre: e.target.value})} style={{...inputStyle, gridColumn: '1 / span 2'}}>
            <option value="">Choisir l'arbitre du match</option>
            {arbitres.map(arb => <option key={arb.id} value={arb.nom}>{arb.nom} {arb.prenom}</option>)}
          </select>

          <button type="submit" style={{ gridColumn: '1 / span 2', backgroundColor: '#1a1a1a', color: 'white', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}>
            Enregistrer le match
          </button>
        </form>
      )}

      <div className="grid-container">
        {matchs.length > 0 ? (
          matchs.map((m) => (
            <div key={m.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{m.equipeA} 🆚 {m.equipeB}</span>
                <span style={{ color: '#F97316', fontWeight: 'bold' }}>{m.date.replace('T', ' ')}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0' }}>🏆 {m.competition}</p>
              <p style={{ fontSize: '0.85rem', color: '#1a1a1a', fontWeight: '600' }}>🏁 Arbitre : {m.arbitre}</p>
              <Link href={`/matchs/${m.id}`} style={{ display: 'inline-block', marginTop: '15px', color: '#F97316', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #F97316', padding: '8px 15px', borderRadius: '6px' }}>
                Démarrer la table ⏱️
              </Link>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
            Aucun match programmé. Utilisez le bouton ci-dessus pour commencer.
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
  backgroundColor: 'white'
};