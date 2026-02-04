"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// On utilise l'alias @ pour être sûr que Turbopack trouve le fichier
import "@/app/globals.css"; 

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

              {/* Bloc déconnexion */}
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

        <style jsx global>{`
          body { margin: 0; font-family: sans-serif; background: #f4f4f4; }
          .layout-container { display: flex; min-height: 100vh; }
          .sidebar { 
            width: 280px; background: #111827; height: 100vh; position: fixed; 
            display: flex; flex-direction: column; z-index: 1000; transition: 0.3s ease;
          }
          .main-content { 
            flex: 1; margin-left: 280px; padding: 20px; 
            width: calc(100% - 280px); min-height: 100vh;
          }
          .sidebar-brand { padding: 30px 20px; text-align: center; }
          .nav-list { flex: 1; padding: 0 15px; overflow-y: auto; }
          .nav-item { display: block; padding: 12px 15px; color: #94a3b8; text-decoration: none; border-radius: 10px; margin-bottom: 5px; font-weight: 600; transition: 0.2s; font-size: 0.9rem; }
          .nav-item:hover { background: #1f2937; color: white; }
          .nav-item.active { background: #F97316 !important; color: white !important; }
          .nav-section { margin-top: 25px; }
          .section-title { font-size: 0.65rem; color: #4b5563; padding-left: 15px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .section-title.admin { color: #F97316; }
          .profile-footer { padding: 20px; border-top: 1px solid #1f2937; background: #0f172a; }
          .conn-label { margin: 0; font-size: 0.65rem; color: #64748b; font-weight: 800; }
          .user-display { color: white; font-size: 1.1rem; display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .btn-logout { width: 100%; margin-top: 15px; padding: 10px; border-radius: 10px; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.8rem; }
          .btn-logout:hover { background: #ef4444; color: white; }
          .burger-btn { display: none; position: fixed; top: 15px; right: 15px; z-index: 2000; background: #F97316; color: white; border: none; border-radius: 8px; padding: 10px 15px; font-size: 1.2rem; cursor: pointer; }
          .menu-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
          @media (max-width: 900px) {
            .sidebar { transform: translateX(-100%); width: 260px; }
            .sidebar.mobile-open { transform: translateX(0); }
            .main-content { margin-left: 0; width: 100%; padding-top: 70px; }
            .burger-btn { display: block; }
            .menu-overlay { display: block; }
          }
        `}</style>
      </body>
    </html>
  );
}