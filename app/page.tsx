"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OneSignal from 'react-onesignal';

// --- 1. COMPOSANTS DE STYLE INTERNES (CORRIGÉS POUR MOBILE) ---
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'white', padding: '20px', borderRadius: '24px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: color }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '10px', borderRadius: '12px', fontSize: '1.2rem' }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1E293B', lineHeight: '1' }}>{value}</div>
      </div>
      <div style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

// --- 2. COMPOSANT PRINCIPAL ---
export default function Dashboard() {
  const [stats, setStats] = useState({ compets: 0, equipes: 0, matchs: 0 });
  const [prochainMatch, setProchainMatch] = useState<any>(null);
  const [dernierResultat, setDernierResultat] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) { 
        router.replace('/login'); 
        return; 
      }
      
      setUser({
        ...session.user,
        ...JSON.parse(localStorage.getItem('currentUser') || '{}')
      });

      try {
        await OneSignal.init({
          appId: "a60eae06-8739-4515-8827-858c2ec0c07b",
          allowLocalhostAsSecureOrigin: true,
        });
        OneSignal.Notifications.requestPermission();
      } catch (err) {
        console.error("OneSignal Error:", err);
      }

      try {
        const [competsRes, equipesRes, matchsRes, nextRes, lastRes] = await Promise.all([
          supabase.from('competitions').select('*', { count: 'exact', head: true }),
          supabase.from('equipes_clubs').select('*', { count: 'exact', head: true }),
          supabase.from('matchs').select('*', { count: 'exact', head: true }),
          supabase.from('matchs').select('*').eq('status', 'a-venir').order('date', { ascending: true }).limit(1).maybeSingle(),
          supabase.from('matchs').select('*').eq('status', 'termine').order('date', { ascending: false }).limit(1).maybeSingle()
        ]);

        setStats({
          compets: competsRes.count || 0,
          equipes: equipesRes.count || 0,
          matchs: matchsRes.count || 0
        });

        if (nextRes.data) setProchainMatch(nextRes.data);
        if (lastRes.data) setDernierResultat(lastRes.data);

      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const formatteDateParis = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Paris' 
    });
  };

  const isAdmin = user?.role === 'admin' || user?.username?.toLowerCase() === 'admin' || user?.username?.toLowerCase() === 'anthony.didier.prop' || user?.user_metadata?.role === 'admin';

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🏀</div>
        <p style={{ color: '#64748B', fontWeight: 'bold' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '15px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* HEADER ADAPTÉ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                    DUNKLY<span style={{ color: '#F97316' }}>.</span>
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Salut, {user?.prenom || user?.username}</p>
            </div>
            {isAdmin && (
                <Link href="/membres" style={btnAdminStyle}>👥</Link>
            )}
        </div>
      </div>

      {/* GRILLE DE STATS (S'ADAPTE SUR MOBILE) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: '12px', 
        marginBottom: '30px' 
      }}>
        <StatCard label="Ligues" value={stats.compets} icon="🏆" color="#F97316" />
        <StatCard label="Clubs" value={stats.equipes} icon="🛡️" color="#3B82F6" />
        <StatCard label="Matchs" value={stats.matchs} icon="⏱️" color="#10B981" />
      </div>

      {/* CARTES MATCHS (STACK SUR MOBILE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* PROCHAIN MATCH */}
        <div style={{ backgroundColor: '#1E293B', padding: '20px', borderRadius: '24px', color: 'white' }}>
          <h3 style={titleSectionStyle}>📅 Prochain RDV</h3>
          {prochainMatch ? (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#F97316', fontWeight: 'bold', marginBottom: '10px' }}>{prochainMatch.competition}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '900' }}>{prochainMatch.clubA}</div>
                </div>
                <div style={{ color: '#F97316', fontWeight: '900', fontSize: '0.8rem', padding: '0 10px' }}>VS</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '900' }}>{prochainMatch.clubB}</div>
                </div>
              </div>
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#94A3B8' }}>
                <div style={{ color: 'white' }}>🕒 {formatteDateParis(prochainMatch.date)}</div>
              </div>
            </div>
          ) : <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Aucun match programmé.</p>}
        </div>

        {/* DERNIER RÉSULTAT */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ ...titleSectionStyle, color: '#64748B' }}>🏆 Dernier Score</h3>
          {dernierResultat ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', flex: 1, textAlign: 'right' }}>{dernierResultat.clubA}</span>
                <span style={{ backgroundColor: '#1E293B', color: 'white', padding: '5px 12px', borderRadius: '10px', fontWeight: '900' }}>
                  {dernierResultat.scoreA} - {dernierResultat.scoreB}
                </span>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', flex: 1, textAlign: 'left' }}>{dernierResultat.clubB}</span>
              </div>
            </div>
          ) : <p style={{ textAlign: 'center', color: '#94A3B8' }}>Aucun résultat.</p>}
        </div>

      </div>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
        © 2026 <strong>DUNKLY</strong> • V 1.1.5
      </footer>
    </div>
  );
}

const titleSectionStyle = { 
    fontSize: '0.7rem', fontWeight: '800', marginBottom: '15px', textTransform: 'uppercase' as const, letterSpacing: '1px' 
};

const btnAdminStyle = { 
  backgroundColor: '#1E293B', color: 'white', textDecoration: 'none', 
  width: '45px', height: '45px', borderRadius: '12px', display: 'flex', 
  alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' 
};