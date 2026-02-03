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

// --- 2. COMPOSANTS INTERNES ---

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
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
    </div>
  );
}

function ActionRow({ href, icon, text, sub, primary = false }: { href: string; icon: string; text: string; sub: string; primary?: boolean }) {
  return (
    <Link href={href} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px',
      textDecoration: 'none', backgroundColor: primary ? '#F9731610' : '#F8FAFC',
      border: primary ? '1px solid #F9731630' : '1px solid #F1F5F9',
      marginBottom: '10px'
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

// --- 3. COMPOSANT PRINCIPAL ---

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ compets: 0, equipes: 0, matchs: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        setUser({ username: supabaseUser.email?.split('@')[0] || 'Anthony' });
        setLoading(false);
      } else {
        router.push('/login');
      }
    };

    checkUser();

    const c = (getFromLocal('competitions') || []) as any[];
    const e = (getFromLocal('equipes') || []) as any[];
    const m = (getFromLocal('matchs') || []) as any[];
    
    setStats({ 
        compets: c.length, 
        equipes: e.length, 
        matchs: m.length 
    });

    const users = (getFromLocal('users') || []) as User[];
    setAllUsers(users);
  }, [router]);

  const isAdmin = user?.username === 'admin' || user?.username === 'anthony.didier.prop';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏀</div>
          <p style={{ fontWeight: 'bold', color: '#64748B', fontFamily: 'sans-serif' }}>Chargement de Dunkly...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh' }}>
      
      {/* HEADER AVEC BOUTON MODALE */}
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

      {/* GRILLE DE STATS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
      }}>
        <StatCard label="Championnats" value={stats.compets} icon="🏆" color="#F97316" />
        <StatCard label="Clubs & Équipes" value={stats.equipes} icon="🛡️" color="#3B82F6" />
        <StatCard label="Matchs Joués" value={stats.matchs} icon="⏱️" color="#10B981" />
      </div>

      {/* SECTION CENTRALE : ACTIONS + LIVE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* PANEL ACTIONS */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '25px', color: '#1E293B' }}>⚡ Actions Prioritaires</h3>
          <ActionRow href="/matchs" icon="🏀" text="Saisir un score" sub="Mise à jour live" primary />
          <ActionRow href="/equipes" icon="👥" text="Ajouter équipe" sub="Gestion des clubs" />
        </div>

        {/* PANEL LIVE (STYLE SOMBRE) */}
        <div style={{ backgroundColor: '#1E293B', padding: '30px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>État du Live</h3>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              ● AUCUN MATCH EN COURS
            </div>
            <p style={{ color: '#94A3B8', lineHeight: '1.6' }}>
              Tous les résultats sont à jour. Les prochaines rencontres débuteront selon le calendrier programmé.
            </p>
            <Link href="/matchs" style={{ display: 'inline-block', marginTop: '20px', color: '#F97316', textDecoration: 'none', fontWeight: 'bold' }}>
              Voir le calendrier complet →
            </Link>
          </div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1, transform: 'rotate(-15deg)' }}>🏀</div>
        </div>
      </div>

      {/* MODALE MEMBRES (ADMIN SEULEMENT) */}
      {isModalOpen && isAdmin && (
        <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontWeight: '900' }}>🛡️ Gestion des Accès</h2>
              <button onClick={() => setIsModalOpen(false)} style={closeBtn}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {allUsers.map((u, index) => (
                <div key={index} style={userRow}>
                  <div style={avatarStyle(u.username === 'admin' || u.username === 'anthony.didier.prop')}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: (u.username === 'admin' || u.username === 'anthony.didier.prop') ? '#F97316' : '#64748B', fontWeight: '800' }}>
                      {(u.username === 'admin' || u.username === 'anthony.didier.prop') ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/admin/users" style={manageLink}>
              Aller à la page de gestion complète →
            </Link>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: 'auto', padding: '40px 0 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
        <div>© 2026 <strong>DUNKLY</strong> by Anthony</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Version 1.0.4</span>
          <span style={{ color: '#10B981' }}>● Système en ligne</span>
        </div>
      </footer>
    </div>
  );
}

// --- 4. STYLES ---

const btnAdminStyle = {
  backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '12px 20px', 
  borderRadius: '12px', fontWeight: '800' as const, cursor: 'pointer', fontSize: '0.8rem'
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
};

const modalContent: React.CSSProperties = {
  backgroundColor: 'white', padding: '35px', borderRadius: '28px',
  width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
};

const userRow = {
  display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
  backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9'
};

const avatarStyle = (isAdmin: boolean) => ({
  width: '40px', height: '40px', borderRadius: '12px',
  backgroundColor: isAdmin ? '#F97316' : '#1E293B', color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' as const
});

const closeBtn = {
  background: '#F1F5F9', border: 'none', width: '35px', height: '35px',
  borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' as const
};

const manageLink: React.CSSProperties = {
  display: 'block', textAlign: 'center', marginTop: '25px', color: '#F97316',
  textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem'
};