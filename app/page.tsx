"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- 1. COMPOSANTS DE STYLE INTERNES ---
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'white', padding: '25px', borderRadius: '24px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9',
      transition: 'transform 0.2s ease', cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '16px', fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1E293B', lineHeight: '1' }}>{value}</div>
      </div>
      <div style={{ fontWeight: '700', color: '#475569', fontSize: '1rem' }}>{label}</div>
      <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', marginTop: '15px' }}>
        <div style={{ width: '60%', height: '100%', backgroundColor: color, borderRadius: '2px' }}></div>
      </div>
    </div>
  );
}

function ActionRow({ href, icon, text, sub, primary = false }: { href: string; icon: string; text: string; sub: string; primary?: boolean }) {
  return (
    <Link href={href} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px',
      textDecoration: 'none', backgroundColor: primary ? '#F9731610' : '#F8FAFC',
      border: primary ? '1px solid #F9731630' : '1px solid #F1F5F9',
      marginBottom: '10px', transition: 'all 0.2s'
    }}>
      <div style={{ fontSize: '1.5rem', filter: primary ? 'none' : 'grayscale(1)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '700', color: primary ? '#F97316' : '#1E293B', fontSize: '0.95rem' }}>{text}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{sub}</div>
      </div>
      <div style={{ color: primary ? '#F97316' : '#CBD5E1', fontWeight: 'bold' }}>→</div>
    </Link>
  );
}

// --- 2. COMPOSANT PRINCIPAL ---
export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0 });
  const [lastMatch, setLastMatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        router.replace('/login');
        return;
      }
      setUser(JSON.parse(stored));

      try {
        const [competsRes, equipesRes, matchsRes, lastMatchRes] = await Promise.all([
          supabase.from('competitions').select('*', { count: 'exact', head: true }),
          supabase.from('equipes_clubs').select('*', { count: 'exact', head: true }),
          supabase.from('matchs').select('*', { count: 'exact', head: true }),
          supabase.from('matchs').select('*').order('created_at', { ascending: false }).limit(1).single()
        ]);

        setStats({
          compets: competsRes.count || 0,
          equipes: equipesRes.count || 0,
          matchs: matchsRes.count || 0
        });

        if (lastMatchRes.data) setLastMatch(lastMatchRes.data);

      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const isAdmin = user?.role === 'admin' || user?.username?.toLowerCase() === 'admin' || user?.username?.toLowerCase() === 'anthony.didier.prop';

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🏀</div>
        <p style={{ color: '#64748B', fontWeight: 'bold' }}>Chargement du terrain...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Accueil <span style={{ color: '#F97316' }}>.</span>
          </h1>
          <p style={{ color: '#64748B', marginTop: '5px' }}>
            Ravi de vous revoir, <strong>{user?.prenom || user?.username}</strong>.
          </p>
        </div>

        {isAdmin && (
          <Link href="/membres" style={btnAdminStyle}>
            👥 GÉRER LES MEMBRES
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <StatCard label="Championnats" value={stats.compets} icon="🏆" color="#F97316" />
        <StatCard label="Clubs & Équipes" value={stats.equipes} icon="🛡️" color="#3B82F6" />
        <StatCard label="Matchs Total" value={stats.matchs} icon="⏱️" color="#10B981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '25px', color: '#1E293B' }}>⚡ Actions Rapides</h3>
          <ActionRow href="/matchs/a-venir" icon="📅" text="Calendrier" sub="Matchs programmés" primary />
          <ActionRow href="/resultats" icon="📊" text="Résultats" sub="Consulter les scores" />
          <ActionRow href="/competitions" icon="⚙️" text="Paramètres" sub="Clubs et tournois" />
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '40px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#94A3B8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dernière Activité</h3>
            
            {lastMatch ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#F97316', fontWeight: 'bold', marginBottom: '10px' }}>{lastMatch.competition}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{lastMatch.equipeA}</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>{lastMatch.scoreA} - {lastMatch.scoreB}</div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{lastMatch.equipeB}</div>
                </div>
                <div style={{ marginTop: '20px', color: '#94A3B8', fontSize: '0.85rem' }}>Match terminé le {new Date(lastMatch.created_at).toLocaleDateString()}</div>
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>Aucune donnée de match récente.</p>
            )}
          </div>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '150px', opacity: 0.05, transform: 'rotate(20deg)' }}>🏀</div>
        </div>
      </div>

      <footer style={{ marginTop: 'auto', padding: '40px 0 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.85rem' }}>
        <div>© 2026 <strong>DUNKLY</strong></div>
        <div>V 1.0.8</div>
      </footer>
    </div>
  );
}

const btnAdminStyle = { 
  backgroundColor: '#1E293B', color: 'white', textDecoration: 'none', 
  padding: '12px 24px', borderRadius: '14px', fontWeight: '800' as const, fontSize: '0.85rem' 
};