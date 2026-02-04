"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// On remonte d'un niveau pour atteindre la racine de 'basketball'
import "../globals.css"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur session", e);
      }
    }
    setLoading(false);

    if (!storedUser && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  
  const isAdmin = 
    user?.role?.toLowerCase() === 'admin' ||
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
        {!isLoginPage ? (
          <div className="layout-container">
            <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '✕' : '☰'}
            </button>

            <nav className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-brand">
                <h2 style={{ color: '#F97316', margin: 0, fontWeight: '900' }}>🏀 DUNKLY</h2>
              </div>
              
              <div className="nav-list">
                <Link href="/" className="nav-item">🏠 Accueil</Link>
                <Link href="/competitions" className="nav-item">🏆 Compétitions</Link>
                <Link href="/equipes" className="nav-item">🛡️ Clubs</Link>

                <div className="nav-section">
                  <p className="section-title">MATCHS</p>
                  <Link href="/matchs/resultats" className="nav-item">✅ Résultats</Link>
                  <Link href="/matchs/a-venir" className="nav-item">📅 À venir</Link>
                </div>

                {isAdmin && (
                  <div className="nav-section">
                    <p className="section-title admin">ADMIN</p>
                    <Link href="/membres" className="nav-item">👥 Membres</Link>
                    <Link href="/arbitres" className="nav-item">🏁 Arbitres</Link>
                  </div>
                )}
              </div>

              <div className="profile-footer">
                <p className="user-display">{user?.username || 'Utilisateur'}</p>
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
        ) : (
          children
        )}

        <style jsx global>{`
          body { margin: 0; font-family: sans-serif; background: #f4f4f4; }
          .layout-container { display: flex; min-height: 100vh; }
          .sidebar { 
            width: 280px; background: #111827; height: 100vh; position: fixed; 
            display: flex; flex-direction: column; z-index: 1000;
          }
          .main-content { flex: 1; margin-left: 280px; padding: 20px; }
          .sidebar-brand { padding: 30px 20px; text-align: center; }
          .nav-list { flex: 1; padding: 0 15px; }
          .nav-item { display: block; padding: 12px 15px; color: #94a3b8; text-decoration: none; border-radius: 10px; }
          .nav-item:hover { background: #1f2937; color: white; }
          .section-title { font-size: 0.7rem; color: #4b5563; padding: 15px 0 5px 15px; font-weight: bold; }
          .profile-footer { padding: 20px; border-top: 1px solid #1f2937; background: #0f172a; }
          .user-display { color: white; margin-bottom: 10px; display: block; }
          .btn-logout { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ef4444; background: none; color: #ef4444; cursor: pointer; }
          .burger-btn { display: none; }
          @media (max-width: 900px) {
            .sidebar { transform: translateX(-100%); transition: 0.3s; }
            .sidebar.mobile-open { transform: translateX(0); }
            .main-content { margin-left: 0; }
            .burger-btn { display: block; position: fixed; top: 15px; right: 15px; z-index: 2000; background: #F97316; border: none; padding: 10px; color: white; border-radius: 5px; }
          }
        `}</style>
      </body>
    </html>
  );
}