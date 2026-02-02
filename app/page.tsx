"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));

    // CORRECTION : Ajout de : any[] pour débloquer le .length au build
    const c: any[] = getFromLocal('competitions') || [];
    const e: any[] = getFromLocal('equipes') || [];
    const m: any[] = getFromLocal('matchs') || [];
    
    setStats({ 
        compets: c.length, 
        equipes: e.length, 
        matchs: m.length 
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh' }}>
      
      {/* SECTION BIENVENUE */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-1px', margin: 0 }}>
          Accueil <span style={{ color: '#F97316' }}>.</span>
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', marginTop: '5px' }}>
          Ravi de vous revoir, <strong>{user?.username || 'Anthony'}</strong>.
        </p>
      </div>

      {/* GRILLE DE STATS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
      }}>
        <StatCard label="Championnats" value={stats.compets} icon="🏆" color="#F97316" trend="+1 cette semaine" />
        <StatCard label="Clubs & Équipes" value={stats.equipes} icon="🛡️" color="#3B82F6" trend="Actifs" />
        <StatCard label="Matchs Joués" value={stats.matchs} icon="⏱️" color="#10B981" trend="En temps réel" />
      </div>

      {/* SECTION CENTRALE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', flex: 1 }}>
        
        {/* PANEL ACTIONS */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '25px', color: '#1E293B' }}>⚡ Actions Prioritaires</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <ActionRow href="/matchs" icon="🏀" text="Saisir un nouveau score" sub="Mise à jour immédiate du classement" primary />
            <ActionRow href="/equipes" icon="👥" text="Ajouter une équipe" sub="Inscrire un club à un tournoi" />
          </div>
        </div>

        {/* PANEL INFO / LIVE */}
        <div style={{ backgroundColor: '#1E293B', padding: '30px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>État du Live</h3>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              ● AUCUN MATCH EN COURS
            </div>
            <p style={{ color: '#94A3B8', lineHeight: '1.6' }}>
              Tous les résultats sont à jour. Les prochaines rencontres débuteront selon le calendrier programmé.
            </p>
            <Link href="/matchs/a-venir" style={{ display: 'inline-block', marginTop: '20px', color: '#F97316', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Voir le calendrier complet →
            </Link>
          </div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1, transform: 'rotate(-15deg)' }}>🏀</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ marginTop: '50px', padding: '20px 0', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
        <div>© 2026 <strong>DUNKLY</strong> by Anthony</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Version 1.0.4</span>
          <span style={{ color: '#10B981' }}>● Système en ligne</span>
        </div>
      </footer>
    </div>
  );
}

// COMPOSANTS INTERNES
function StatCard({ label, value, icon, color, trend }: any) {
  return (
    <div style={{ 
      backgroundColor: 'white', padding: '25px', borderRadius: '24px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '16px', fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1E293B', lineHeight: '1' }}>{value}</div>
      </div>
      <div style={{ fontWeight: '700', color: '#475569', fontSize: '1rem' }}>{label}</div>
      <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '5px', fontWeight: '500' }}>{trend}</div>
    </div>
  );
}

function ActionRow({ href, icon, text, sub, primary = false }: any) {
  return (
    <Link href={href} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px',
      textDecoration: 'none', backgroundColor: primary ? '#F9731610' : '#F8FAFC',
      border: primary ? '1px solid #F9731630' : '1px solid #F1F5F9'
    }}>
      <div style={{ fontSize: '1.5rem', filter: primary ? 'none' : 'grayscale(1)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '700', color: primary ? '#F97316' : '#1E293B', fontSize: '0.95rem' }}>{text}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{sub}</div>
      </div>
      <div style={{ color: primary ? '#F97316' : '#CBD5E1' }}>→</div>
    </Link>
  );
}