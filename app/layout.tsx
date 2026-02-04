"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    setLoading(false);
    if (!storedUser && pathname !== '/login') router.push('/login');
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  if (loading && !isLoginPage) return <html lang="fr"><body><div className="loader"></div></body></html>;

  return (
    <html lang="fr">
      <body className={isLoginPage ? 'login-mode' : 'app-mode'}>
        {!isLoginPage ? (
          <div className="dashboard-container">
            {/* SIDEBAR PC (FLOTTANTE) */}
            <aside className="desktop-sidebar">
              <div className="sidebar-inner">
                <div className="logo-area">
                  <span className="logo-icon">🏀</span>
                  <span className="logo-text">DUNKLY</span>
                </div>
                
                <nav className="nav-menu">
                  <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                    <span className="icon">🏠</span> <span>Accueil</span>
                  </Link>
                  <Link href="/competitions" className={`nav-link ${pathname === '/competitions' ? 'active' : ''}`}>
                    <span className="icon">🏆</span> <span>Compétitions</span>
                  </Link>
                  <Link href="/matchs/resultats" className={`nav-link ${pathname === '/matchs/resultats' ? 'active' : ''}`}>
                    <span className="icon">✅</span> <span>Résultats</span>
                  </Link>
                  <Link href="/equipes" className={`nav-link ${pathname === '/equipes' ? 'active' : ''}`}>
                    <span className="icon">🛡️</span> <span>Clubs</span>
                  </Link>
                  
                  {isAdmin && (
                    <div className="admin-section">
                      <p className="sep">ADMIN</p>
                      <Link href="/membres" className="nav-link"><span className="icon">👥</span> <span>Membres</span></Link>
                    </div>
                  )}
                </nav>

                <div className="user-card">
                  <div className="user-info">
                    <p className="username">{user?.username || 'Joueur'}</p>
                    <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="logout-mini">Quitter</button>
                  </div>
                </div>
              </div>
            </aside>

            {/* CONTENU PRINCIPAL */}
            <main className="main-viewport">
              <header className="mobile-top-bar">
                <span className="logo-text">🏀 DUNKLY</span>
                <div className="user-avatar">{user?.username?.[0] || 'U'}</div>
              </header>
              <div className="content-wrapper">{children}</div>
            </main>

            {/* BARRE DE NAVIGATION MOBILE (BAS DE L'ÉCRAN) */}
            <nav className="mobile-tab-bar">
              <Link href="/" className={`tab-item ${pathname === '/' ? 'active' : ''}`}>
                <span className="tab-icon">🏠</span>
                <span className="tab-label">Accueil</span>
              </Link>
              <Link href="/matchs/resultats" className={`tab-item ${pathname === '/matchs/resultats' ? 'active' : ''}`}>
                <span className="tab-icon">✅</span>
                <span className="tab-label">Scores</span>
              </Link>
              <Link href="/competitions" className={`tab-item ${pathname === '/competitions' ? 'active' : ''}`}>
                <span className="tab-icon">🏆</span>
                <span className="tab-label">Events</span>
              </Link>
              <Link href="/profil" className={`tab-item ${pathname === '/profil' ? 'active' : ''}`}>
                <span className="tab-icon">👤</span>
                <span className="tab-label">Profil</span>
              </Link>
            </nav>
          </div>
        ) : children}

        <style jsx global>{`
          :root {
            --primary: #F97316;
            --primary-dark: #EA580C;
            --bg-app: #F8FAFC;
            --sidebar-bg: #111827;
            --glass: rgba(255, 255, 255, 0.9);
          }

          body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-app); color: #1E293B; overflow-x: hidden; }

          /* LAYOUT STRUCTURE */
          .dashboard-container { display: flex; min-height: 100vh; }

          /* DESKTOP SIDEBAR */
          .desktop-sidebar { width: 280px; padding: 20px; position: fixed; height: 100vh; z-index: 100; }
          .sidebar-inner { 
            background: var(--sidebar-bg); height: 100%; border-radius: 24px; 
            display: flex; flex-direction: column; padding: 30px 20px; color: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .logo-area { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding-left: 10px; }
          .logo-icon { font-size: 24px; }
          .logo-text { font-weight: 900; font-size: 20px; letter-spacing: -1px; color: var(--primary); }

          .nav-menu { flex: 1; }
          .nav-link { 
            display: flex; align-items: center; gap: 12px; padding: 14px 18px;
            color: #94A3B8; text-decoration: none; border-radius: 16px; 
            margin-bottom: 8px; transition: 0.3s; font-weight: 600;
          }
          .nav-link:hover { background: rgba(255,255,255,0.05); color: white; }
          .nav-link.active { background: var(--primary); color: white; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); }

          .admin-section { margin-top: 30px; }
          .sep { font-size: 10px; color: #4B5563; font-weight: 800; letter-spacing: 2px; margin-bottom: 15px; padding-left: 18px; }

          .user-card { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 20px; margin-top: auto; }
          .username { margin: 0; font-weight: 700; font-size: 14px; }
          .logout-mini { background: none; border: none; color: #EF4444; padding: 0; font-size: 12px; cursor: pointer; font-weight: 700; margin-top: 5px; }

          /* MAIN CONTENT AREA */
          .main-viewport { flex: 1; margin-left: 280px; padding: 40px; min-height: 100vh; }
          .mobile-top-bar { display: none; }

          /* MOBILE TAB BAR (BOTTOM NAV) */
          .mobile-tab-bar { 
            display: none; position: fixed; bottom: 0; left: 0; right: 0; 
            background: var(--glass); backdrop-filter: blur(10px);
            height: 70px; border-top: 1px solid #E2E8F0;
            justify-content: space-around; align-items: center; z-index: 1000;
            padding-bottom: 10px;
          }
          .tab-item { text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #64748B; transition: 0.3s; }
          .tab-icon { font-size: 20px; }
          .tab-label { font-size: 10px; font-weight: 700; }
          .tab-item.active { color: var(--primary); }

          /* RESPONSIVE */
          @media (max-width: 1024px) {
            .desktop-sidebar { display: none; }
            .main-viewport { margin-left: 0; padding: 20px; padding-bottom: 100px; }
            .mobile-top-bar { 
              display: flex; justify-content: space-between; align-items: center;
              margin-bottom: 20px; padding: 10px 0;
            }
            .mobile-tab-bar { display: flex; }
            .user-avatar { width: 35px; height: 35px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
          }

          /* LOADER */
          .loader { width: 40px; height: 40px; border: 4px solid #E2E8F0; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; position: absolute; top: 50%; left: 50%; margin: -20px 0 0 -20px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </body>
    </html>
  );
}