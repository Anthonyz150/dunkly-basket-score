"use client";

import { useState, useEffect } from 'react';
import { getFromLocal } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- 1. TYPES ---
interface User {
  username: string;
}

interface Stats {
  compets: number;
  equipes: number;
  matchs: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ compets: 0, equipes: 0, matchs: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // On récupère la session via getSession (plus rapide que getUser pour éviter le flash)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser({ username: session.user.email?.split('@')[0] || 'Anthony' });
        
        // On charge les données locales une fois l'utilisateur validé
        setStats({ 
          compets: (getFromLocal('competitions') || []).length, 
          equipes: (getFromLocal('equipes') || []).length, 
          matchs: (getFromLocal('matchs') || []).length 
        });
        setAllUsers((getFromLocal('users') || []) as User[]);
        
        // On libère l'affichage
        setLoading(false);
      } else {
        // Si vraiment rien, on attend 200ms pour être sûr que ce n'est pas un lag réseau
        setTimeout(() => {
          router.replace('/login');
        }, 200);
      }
    };

    initAuth();
  }, [router]);

  const isAdmin = user?.username === 'admin' || user?.username === 'anthony.didier.prop';

  // --- 2. PROTECTION ANTI-FLASH ---
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="bounce" style={{ fontSize: '4rem', marginBottom: '15px' }}>🏀</div>
          <p style={{ fontWeight: '900', color: '#0F172A', letterSpacing: '2px' }}>VÉRIFICATION DUNKLY...</p>
        </div>
        <style jsx>{`
          .bounce { animation: bounce 0.6s infinite alternate; }
          @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-20px); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Accueil <span style={{ color: '#F97316' }}>.</span>
          </h1>
          <p style={{ color: '#64748B', marginTop: '5px' }}>
            Ravi de vous revoir, <strong>{user?.username}</strong>.
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} style={btnAdminStyle}>
            👥 VOIR LES MEMBRES
          </button>
        )}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <StatCard label="Championnats" value={stats.compets} icon="🏆" color="#F97316" />
        <StatCard label="Clubs & Équipes" value={stats.equipes} icon="🛡️" color="#3B82F6" />
        <StatCard label="Matchs Joués" value={stats.matchs} icon="⏱️" color="#10B981" />
      </div>

      {/* ACTIONS & LIVE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div style={panelStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '25px' }}>⚡ Actions Prioritaires</h3>
          <ActionRow href="/matchs" icon="🏀" text="Saisir un score" sub="Mise à jour live" primary />
          <ActionRow href="/equipes" icon="👥" text="Ajouter équipe" sub="Gestion des clubs" />
        </div>

        <div style={livePanelStyle}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>État du Live</h3>
            <div style={badgeStyle}>● AUCUN MATCH EN COURS</div>
            <p style={{ color: '#94A3B8', lineHeight: '1.6' }}>Tous les résultats sont à jour.</p>
            <Link href="/matchs" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 'bold', display: 'block', marginTop: '15px' }}>
              Voir le calendrier →
            </Link>
          </div>
          <div style={bgIconStyle}>🏀</div>
        </div>
      </div>

      {/* MODALE MEMBRES */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontWeight: '900' }}>🛡️ Gestion des Accès</h2>
              <button onClick={() => setIsModalOpen(false)} style={closeBtn}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.map((u, i) => (
                <div key={i} style={userRow}>
                  <div style={avatarStyle(u.username.includes('admin') || u.username.includes('anthony'))}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{u.username}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>MEMBRE ACTIF</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/users" style={manageLink}>Gestion complète →</Link>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={footerStyle}>
        <div>© 2026 <strong>DUNKLY</strong> by Anthony</div>
        <div style={{ color: '#10B981' }}>● Système en ligne</div>
      </footer>
    </div>
  );
}

// --- 3. COMPOSANTS ET STYLES ---

function StatCard({ label, value, icon, color }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '16px', fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1E293B' }}>{value}</div>
      </div>
      <div style={{ fontWeight: '700', color: '#475569' }}>{label}</div>
    </div>
  );
}

function ActionRow({ href, icon, text, sub, primary = false }: any) {
  return (
    <Link href={href} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px', 
      textDecoration: 'none', backgroundColor: primary ? '#F9731610' : '#F8FAFC', 
      border: primary ? '1px solid #F9731630' : '1px solid #F1F5F9', marginBottom: '10px' 
    }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '700', color: primary ? '#F97316' : '#1E293B' }}>{text}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{sub}</div>
      </div>
      <div style={{ color: primary ? '#F97316' : '#CBD5E1' }}>→</div>
    </Link>
  );
}

// STYLES RÉUTILISABLES
const panelStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' };
const livePanelStyle: React.CSSProperties = { backgroundColor: '#1E293B', padding: '30px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px' };
const bgIconStyle: React.CSSProperties = { position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1, transform: 'rotate(-15deg)' };
const btnAdminStyle = { backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '800' as const, cursor: 'pointer', fontSize: '0.8rem' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalContent: React.CSSProperties = { backgroundColor: 'white', padding: '35px', borderRadius: '28px', width: '90%', maxWidth: '450px' };
const userRow = { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px' };
const avatarStyle = (adm: boolean) => ({ width: '35px', height: '35px', borderRadius: '10px', backgroundColor: adm ? '#F97316' : '#1E293B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' as const });
const closeBtn = { background: '#F1F5F9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' as const };
const manageLink: React.CSSProperties = { display: 'block', textAlign: 'center', marginTop: '20px', color: '#F97316', fontWeight: 'bold', textDecoration: 'none' };
const footerStyle: React.CSSProperties = { marginTop: 'auto', padding: '20px 0', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.85rem' };