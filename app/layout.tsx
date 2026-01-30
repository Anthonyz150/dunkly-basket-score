'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour le menu mobile
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
    setIsMenuOpen(false); // Ferme le menu à chaque changement de page
  }, [pathname, router]);

  if (loading) return <html lang="fr"><body></body></html>;

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
        
        {/* BOUTON BURGER (Affiché uniquement via CSS mobile) */}
        <button 
          className="burger-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* SIDEBAR avec classe dynamique */}
        <nav className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--orange-basket)', margin: 0 }}>🏀 DUNKLY</h2>
          </div>
          
          <div className="nav-container">
            <Link href="/" className="nav-link">🏠 Tableau de bord</Link>
            <Link href="/competitions" className="nav-link">🏆 Compétitions</Link>
            <Link href="/equipes" className="nav-link">👥 Équipes</Link>
            <Link href="/matchs" className="nav-link">⏱️ Matchs & Résultats</Link>
            <Link href="/arbitres" className="nav-link">🏁 Arbitres</Link>

            {user?.username === 'admin' && (
              <div className="admin-section" style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                <p className="admin-title" style={{ fontSize: '0.7rem', color: '#666', marginLeft: '20px', letterSpacing: '1px' }}>ADMINISTRATION</p>
                <Link href="/admin/users" className="nav-link">👥 Comptes Utilisateurs</Link>
              </div>
            )}
          </div>

          <div className="profile-box">
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888' }}>Connecté :</p>
            <strong style={{ display: 'block', marginBottom: '10px', color: 'white' }}>{user?.username}</strong>
            <button 
              className="logout-btn"
              onClick={() => { localStorage.removeItem('currentUser'); window.location.href='/login'; }}
            >
              Déconnexion
            </button>
          </div>
        </nav>

        {/* Overlay pour fermer le menu en cliquant à côté */}
        {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>}

        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ flex: 1, padding: '20px' }}> {/* Padding réduit pour mobile */}
            {children}
          </div>

          <footer style={footerStyle}>
            <div style={footerLineStyle}></div>
            <div style={footerContentStyle}>
              <p style={{ margin: 0 }}>© 2026 🏀 DUNKLY</p>
              <div style={{ display: 'flex', gap: '15px', color: '#666' }}>
                <span>v1.0</span>
                <span>|</span>
                <span>{user?.username === 'admin' ? 'Admin' : 'Lecture'}</span>
              </div>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}

// ... styles du footer conservés ...
const footerStyle: React.CSSProperties = { padding: '20px', color: '#888', fontSize: '0.75rem' };
const footerLineStyle: React.CSSProperties = { height: '1px', background: 'linear-gradient(to right, transparent, #eee, transparent)', marginBottom: '15px' };
const footerContentStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };