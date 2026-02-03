"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function DetailMatchPage() {
  const params = useParams();
  const matchId = params.id;
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      chargerDetailMatch();
    }
  }, [matchId]);

  const chargerDetailMatch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      console.error("Erreur:", error.message);
    } else {
      setMatch(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontFamily: 'sans-serif' }}>
        <p>Chargement des détails du match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontFamily: 'sans-serif' }}>
        <p>Match introuvable.</p>
        <Link href="/matchs/resultats" style={{ color: '#F97316' }}>Retour aux résultats</Link>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Barre de navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => router.back()} style={backBtn}>← RETOUR</button>
        <div style={match.status === 'termine' ? badgeTermine : badgeEnCours}>
          {match.status === 'termine' ? 'MATCH TERMINÉ ✅' : 'MATCH EN COURS ⏱️'}
        </div>
      </div>

      {/* SCORE FINAL */}
      <div style={scoreCard}>
        <div style={teamSide}>
          <h2 style={teamTitle}>{match.clubA}</h2>
          <p style={teamSub}>{match.equipeA}</p>
        </div>
        
        <div style={scoreCenter}>
          <div style={scoreDisplay}>{match.scoreA} - {match.scoreB}</div>
          <div style={dateLabel}>
            {new Date(match.dateFin || match.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>

        <div style={teamSide}>
          <h2 style={teamTitle}>{match.clubB}</h2>
          <p style={teamSub}>{match.equipeB}</p>
        </div>
      </div>

      {/* BLOC INFORMATIONS COMPLÉMENTAIRES */}
      <div style={infoGrid}>
        {match.lieu && (
          <div style={infoCard}>
            <p style={infoLabel}>📍 LIEU DE LA RENCONTRE</p>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.lieu)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={lieuLink}
            >
              <strong>{match.lieu}</strong> 
              <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '5px', color: '#F97316' }}>Voir sur Google Maps ↗</span>
            </a>
          </div>
        )}

        <div style={infoCard}>
          <p style={infoLabel}>🏆 COMPÉTITION</p>
          <p style={infoValue}>{match.competition || "Non renseignée"}</p>
        </div>

        <div style={infoCard}>
          <p style={infoLabel}>🏁 OFFICIEL / ARBITRE</p>
          <p style={infoValue}>{match.arbitre || "Non renseigné"}</p>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const backBtn = { backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' as const, cursor: 'pointer', color: '#64748b' };
const badgeTermine = { backgroundColor: '#22c55e', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' as const };
const badgeEnCours = { backgroundColor: '#f97316', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' as const };

const scoreCard = { 
  display: 'flex', 
  justifyContent: 'space-around', 
  alignItems: 'center', 
  backgroundColor: '#1e293b', 
  color: 'white', 
  padding: '60px 40px', 
  borderRadius: '32px', 
  marginBottom: '30px', 
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
};

const teamSide = { flex: 1, textAlign: 'center' as const };
const teamTitle = { fontSize: '2.2rem', margin: '0 0 5px 0', fontWeight: '800' };
const teamSub = { fontSize: '1.1rem', opacity: 0.7, margin: 0 };
const scoreCenter = { flex: 1, textAlign: 'center' as const };
const scoreDisplay = { fontSize: '6rem', fontWeight: '900', color: '#F97316', lineHeight: 1 };
const dateLabel = { marginTop: '15px', fontSize: '1rem', opacity: 0.8 };

const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
const infoCard = { backgroundColor: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const infoLabel = { fontSize: '0.75rem', fontWeight: 'bold' as const, color: '#64748b', marginBottom: '10px', letterSpacing: '0.5px' };
const infoValue = { fontSize: '1.1rem', fontWeight: '700' as const, color: '#1e293b', margin: 0 };
const lieuLink = { color: '#1e293b', textDecoration: 'none', fontSize: '1.1rem' };