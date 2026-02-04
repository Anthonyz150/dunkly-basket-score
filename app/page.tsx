"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 1. On importe OneSignal
import OneSignal from 'react-onesignal';

// --- 1. COMPOSANTS DE STYLE INTERNES ---
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'white', padding: '25px', borderRadius: '24px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: color }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '16px', fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1E293B', lineHeight: '1' }}>{value}</div>
      </div>
      <div style={{ fontWeight: '700', color: '#475569', fontSize: '1rem' }}>{label}</div>
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

      // --- AJOUT : INITIALISATION ONESIGNAL ---
      try {
        await OneSignal.init({
          appId: "a60eae06-8739-4515-8827-858c2ec0c07b", // <--- METS TON ID ICI
          allowLocalhostAsSecureOrigin: true,
        });
        // Demande la permission de notifier (affiche la cloche ou le pop-up)
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
        alert(error);
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  // FORMATAGE DATE PARIS
  const formatteDateParis = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', { 
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Paris' 
    });
  };

  const isAdmin = user?.role === 'admin' || user?.username?.toLowerCase() === 'admin' || user?.username?.toLowerCase() === 'anthony.didier.prop' || user?.user_metadata?.role === 'admin';

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🏀</div>
        <p style={{ color: '#64748B', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Préparation du parquet...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Accueil <span style={{ color: '#F97316' }}>.</span>
          </h1>
          <p style={{ color: '#64748B', marginTop: '5px' }}>
            Ravi de vous revoir, <strong>{user?.prenom || user?.username || user?.email}</strong>.
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
        
        <div style={{ backgroundColor: '#1E293B', padding: '30px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>📅 Prochain RDV</h3>
            {prochainMatch ? (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#F97316', fontWeight: 'bold', marginBottom: '5px' }}>{prochainMatch.competition}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase' }}>{prochainMatch.clubA}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold' }}>{prochainMatch.equipeA}</div>
                  </div>
                  <div style={{ color: '#F97316', fontWeight: '900', fontSize: '1rem' }}>VS</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase' }}>{prochainMatch.clubB}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold' }}>{prochainMatch.equipeB}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>
                  <span style={{ color: 'white', fontWeight: '600' }}>🕒 {formatteDateParis(prochainMatch.date)}</span>
                  <span>📍 {prochainMatch.lieu || 'Lieu non défini'}</span>
                </div>
                <Link href="/matchs/a-venir" style={{ display: 'inline-block', marginTop: '20px', color: '#F97316', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}>Voir le calendrier →</Link>
              </div>
            ) : ( <p style={{ color: '#475569' }}>Aucun match programmé.</p> )}
          </div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px', opacity: 0.05, transform: 'rotate(-15deg)' }}>🏀</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏆 Dernier Résultat</h3>
          {dernierResultat ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#F97316', fontWeight: 'bold', marginBottom: '15px' }}>{dernierResultat.competition}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#1E293B', textTransform: 'uppercase' }}>{dernierResultat.clubA}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 'bold' }}>{dernierResultat.equipeA}</div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', backgroundColor: '#1E293B', padding: '8px 16px', borderRadius: '12px', minWidth: '100px' }}>
                  {dernierResultat.scoreA} - {dernierResultat.scoreB}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#1E293B', textTransform: 'uppercase' }}>{dernierResultat.clubB}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 'bold' }}>{dernierResultat.equipeB}</div>
                </div>
              </div>
              <Link href="/resultats" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #E2E8F0' }}>Tous les résultats ↗</Link>
            </div>
          ) : ( <p style={{ textAlign: 'center', color: '#94A3B8' }}>Aucun résultat enregistré.</p> )}
        </div>
      </div>

      <footer style={{ marginTop: 'auto', padding: '40px 0 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.85rem' }}>
        <div>© 2026 <strong>DUNKLY</strong></div>
        <div>V 1.1.5</div>
      </footer>
    </div>
  );
}

const btnAdminStyle = { 
  backgroundColor: '#1E293B', color: 'white', textDecoration: 'none', 
  padding: '12px 24px', borderRadius: '14px', fontWeight: '800' as const, fontSize: '0.85rem' 
};