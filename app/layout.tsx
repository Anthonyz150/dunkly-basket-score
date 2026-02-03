"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const loadUser = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur de parsing", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    setLoading(false);
    setIsMenuOpen(false);

    // Redirection si déconnecté (sauf sur login)
    if (!localStorage.getItem('currentUser') && pathname !== '/login') {
      router.push('/login');
    }

    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  
  const isAdmin = 
    user?.role === 'admin' ||
    user?.username?.toLowerCase() === 'admin' || 
    user?.username?.toLowerCase() === 'anthony.didier.prop' ||
    user?.email === 'anthony.didier.prop@gmail.com';

  if (loading && !isLoginPage) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a' }}>🏀</div>;

  return (
    <html lang="fr">
      <body className={isLoginPage ? 'login-body' : 'app-body'} style={{ backgroundColor: isLoginPage ? '#111' : '#f4f4f4', margin: 0 }}>
        {isLoginPage ? (
          children
        ) : (
          <>
            <button className="burger-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>}

            <nav className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <h2 style={{ color: '#F97316', margin: 0, fontWeight: '900' }}>🏀 DUNKLY</h2>
              </div>
              
              <div className="nav-container">
                <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>🏠 Accueil</Link>
                <Link href="/competitions" className={`nav-link ${pathname === '/competitions' ? 'active' : ''}`}>🏆 Compétitions</Link>
                
                <div style={navGroup}>
                  <p style={groupLabel}>MATCHS</p>
                  <Link href="/matchs/resultats" className={`nav-link ${pathname === '/matchs/resultats' ? 'active' : ''}`}>✅ Résultats</Link>
                  <Link href="/matchs/a-venir" className={`nav-link ${pathname === '/matchs/a-venir' ? 'active' : ''}`}>📅 À venir</Link>
                </div>

                {isAdmin && (
                  <div style={navGroup}>
                    <p style={{ ...groupLabel, color: '#F97316' }}>ADMINISTRATION</p>
                    <Link href="/membres" className={`nav-link ${pathname === '/membres' ? 'active' : ''}`}>👥 Gestion Membres</Link>
                  </div>
                )}

                <div style={navGroup}>
                  <p style={groupLabel}>PARAMÈTRES</p>
                  <Link href="/profil" className={`nav-link ${pathname === '/profil' ? 'active' : ''}`}>👤 Mon Profil</Link>
                </div>
              </div>

              <div className="profile-box">
                <strong style={{ color: 'white', display: 'block', marginBottom: '10px' }}>
                   {user?.prenom ? `${user.prenom} ${user.nom}` : (user?.username || 'Utilisateur')}
                </strong>
                <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={logoutBtn}>
                  Déconnexion
                </button>
              </div>
            </nav>

            <main className="main-content" style={{ padding: '20px', minHeight: '100vh' }}>
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}

const navGroup = { marginTop: '25px', marginBottom: '10px' };
const groupLabel = { fontSize: '0.7rem', color: '#555', marginLeft: '20px', fontWeight: 'bold' as const };
const logoutBtn = { width: '100%', color: '#ff4444', border: '1px solid #ff4444', background: 'rgba(255, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', cursor: 'pointer' };