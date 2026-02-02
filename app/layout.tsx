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
    // 1. On enveloppe dans un try/finally pour garantir que loading passe à false
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (pathname !== '/login') {
        router.push('/login');
      }
    } catch (e) {
      console.error("Erreur Auth:", e);
    } finally {
      // 2. On attend un tout petit peu pour laisser le routeur se caler
      setTimeout(() => setLoading(false), 300);
    }
    
    setIsMenuOpen(false);
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  const bgColor = isLoginPage ? '#111111' : '#f4f4f4';

  // 3. SECURITÉ : Si loading est vrai, on affiche le loader
  if (loading) {
    return (
      <html lang="fr">
        <body style={{ backgroundColor: '#f4f4f4', margin: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <span style={{ fontSize: '3rem', animation: 'bounce 0.6s infinite alternate' }}>🏀</span>
            <p style={{ fontWeight: 'bold', marginTop: '10px', color: '#1a1a1a' }}>Chargement Dunkly...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr" style={{ backgroundColor: bgColor }}>
      <body className={isLoginPage ? 'login-body' : 'app-body'} style={{ backgroundColor: bgColor, margin: 0 }}>
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
                <Link href="/equipes" className={`nav-link ${pathname === '/equipes' ? 'active' : ''}`}>👥 Équipes</Link>

                <div style={{ marginTop: '25px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#555', marginLeft: '20px', fontWeight: 'bold' }}>MATCHS</p>
                  <Link href="/matchs/resultats" className={`nav-link ${pathname === '/matchs/resultats' ? 'active' : ''}`}>✅ Résultats</Link>
                  <Link href="/matchs/a-venir" className={`nav-link ${pathname === '/matchs/a-venir' ? 'active' : ''}`}>📅 Matchs à venir</Link>
                </div>
                <Link href="/arbitres" className={`nav-link ${pathname === '/arbitres' ? 'active' : ''}`}>🏁 Arbitres</Link>
              </div>

              <div className="profile-box">
                <strong style={{ color: 'white', display: 'block', marginBottom: '10px' }}>{user?.username || 'Admin'}</strong>
                <button onClick={() => { localStorage.removeItem('currentUser'); window.location.href='/login'; }} style={{ width: '100%', color: '#ff4444', border: '1px solid #ff4444', background: 'transparent', padding: '8px', borderRadius: '6px' }}>
                  Déconnexion
                </button>
              </div>
            </nav>

            <main className="main-content" style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', marginLeft: '250px' }}>
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}