"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

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
        console.error("Erreur parsing", e);
      }
    }
  };

  useEffect(() => {
    loadUser();
    setLoading(false);
    setIsMenuOpen(false);

    if (!localStorage.getItem('currentUser') && pathname !== '/login') {
      router.push('/login');
    }

    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  
  const isAdmin = 
    user?.role?.toLowerCase() === 'admin' ||
    user?.username?.toLowerCase() === 'admin' || 
    user?.email === 'anthony.didier.pro@gmail.com';

  if (loading && !isLoginPage) {
    return (
      <html lang="fr">
        <body style={{ background: '#111827' }}></body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body className={isLoginPage ? 'login-body' : 'app-body'}>
        {isLoginPage ? (
          children
        ) : (
          <div className="layout-container">
            <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

            <nav className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-brand">
                <h2 style={{ color: '#F97316', margin: 0, fontWeight: '900' }}>🏀 DUNKLY</h2>
              </div>
              
              <div className="nav-list">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>🏠 Accueil</Link>
                <Link href="/competitions" className={`nav-item ${pathname === '/competitions' ? 'active' : ''}`}>🏆 Compétitions</Link>
                
                <div className="nav-section">
                  <p className="section-title">CLUBS</p>
                  <Link href="/equipes" className={`nav-item ${pathname === '/equipes' ? 'active' : ''}`}>🛡️ Clubs</Link>
                </div>

                <div className="nav-section">
                  <p className="section-title">MATCHS</p>
                  <Link href="/matchs/resultats" className={`nav-item ${pathname === '/matchs/resultats' ? 'active' : ''}`}>✅ Résultats</Link>
                  <Link href="/matchs/a-venir" className={`nav-item ${pathname === '/matchs/a-venir' ? 'active' : ''}`}>📅 À venir</Link>
                </div>

                {isAdmin && (
                  <div className="nav-section">
                    <p className="section-title admin">ADMINISTRATION</p>
                    <Link href="/membres" className={`nav-item ${pathname === '/membres' ? 'active' : ''}`}>👥 Gestion Membres</Link>
                    <Link href="/arbitres" className={`nav-item ${pathname === '/arbitres' ? 'active' : ''}`}>🏁 Arbitres</Link>
                  </div>
                )}

                <div className="nav-section">
                  <p className="section-title">PARAMÈTRES</p>
                  <Link href="/profil" className={`nav-item ${pathname === '/profil' ? 'active' : ''}`}>👤 Mon Profil</Link>
                </div>
              </div>

              <div className="profile-footer">
                <div className="user-details">
                  <p className="conn-label">CONNECTÉ EN TANT QUE</p>
                  <strong className="user-display">
                     {user?.username || user?.email?.split('@')[0] || 'Arbitre'}
                  </strong>
                </div>
                
                <button 
                  onClick={() => { localStorage.clear(); window.location.href='/login'; }} 
                  className="btn-logout"
                >
                  Déconnexion
                </button>
              </div>
            </nav>

            <main className="main-content">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}