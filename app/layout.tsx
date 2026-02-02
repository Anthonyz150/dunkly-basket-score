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

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (pathname !== '/login') {
      router.push('/login');
    }
    setLoading(false);
    setIsMenuOpen(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <html lang="fr">
        <body>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
            Chargement...
          </div>
        </body>
      </html>
    );
  }

  if (pathname === '/login') {
    return (
      <html lang="fr">
        <body className="login-body">{children}</body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body className="app-body">
        <button className="burger-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <h2 style={{ color: '#F97316', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>🏀 DUNKLY</h2>
          </div>
          
          <div className="nav-container">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>🏠 Accueil</Link>
            <Link href="/competitions" className={`nav-link ${pathname === '/competitions' ? 'active' : ''}`}>🏆 Compétitions</Link>
            <Link href="/equipes" className={`nav-link ${pathname === '/equipes' ? 'active' : ''}`}>👥 Équipes</Link>

            {/* SECTION MATCHS SÉPARÉE */}
            <div style={{ marginTop: '25px', marginBottom: '10px' }}>
              <p style={{ fontSize: '0.7rem', color: '#555', marginLeft: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>MATCHS</p>
              <Link href="/matchs/resultats" className={`nav-link ${pathname === '/matchs/resultats' ? 'active' : ''}`}>
                ✅ Résultats
              </Link>
              <Link href="/matchs/a-venir" className={`nav-link ${pathname === '/matchs/a-venir' ? 'active' : ''}`}>
                📅 Matchs à venir
              </Link>
            </div>

            <Link href="/arbitres" className={`nav-link ${pathname === '/arbitres' ? 'active' : ''}`}>🏁 Arbitres</Link>

            {user?.username === 'admin' && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                <p style={{ fontSize: '0.7rem', color: '#555', marginLeft: '20px', fontWeight: 'bold' }}>ADMIN</p>
                <Link href="/admin/users" className="nav-link">👤 Utilisateurs</Link>
              </div>
            )}
          </div>

          <div className="profile-box" style={{ padding: '20px', borderTop: '1px solid #222' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888' }}>Connecté :</p>
            <strong style={{ display: 'block', marginBottom: '10px', color: 'white' }}>{user?.username}</strong>
            <button 
              className="logout-btn"
              onClick={() => { localStorage.removeItem('currentUser'); window.location.href='/login'; }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Déconnexion
            </button>
          </div>
        </nav>

        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}