'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFromLocal, saveToLocal } from '@/lib/store';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const users: any[] = getFromLocal('users') || [];

    if (isRegister) {
      if (users.find((u: any) => u.username === username)) {
        return alert("Cet utilisateur existe déjà !");
      }
      const newUsers = [...users, { username, password }];
      saveToLocal('users', newUsers);
      alert("Compte créé ! Connectez-vous.");
      setIsRegister(false);
    } else {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        router.push('/');
        router.refresh();
      } else {
        alert("Identifiants incorrects ❌");
      }
    }
  };

  return (
    <main style={loginWrapper}>
      <div style={loginCard}>
        {/* En-tête avec Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
           <div style={logoCircle}>🏀</div>
           <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', margin: '10px 0 5px' }}>
             DUNKLY <span style={{ color: '#F97316' }}>APP</span>
           </h1>
           <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
             {isRegister ? 'Créez votre compte' : 'Connexion à l\'application'}
           </p>
        </div>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Utilisateur</label>
            <input 
              placeholder="Entrez votre nom" 
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={btnStyle}>
            {isRegister ? "CRÉER MON COMPTE" : "SE CONNECTER"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={switchBtnStyle}
        >
          {isRegister ? "Déjà membre ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous ici"}
        </button>
      </div>
    </main>
  );
}

/* ---------- STYLES AMÉLIORÉS (PC & MOBILE) ---------- */

const loginWrapper: React.CSSProperties = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', 
  width: '100vw',
  backgroundColor: '#0f172a', // Bleu nuit très foncé (plus moderne que noir pur)
  backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)',
  backgroundSize: '40px 40px'
};

const loginCard: React.CSSProperties = { 
  width: '90%',
  maxWidth: '450px', // S'élargit sur PC jusqu'à 450px
  padding: '40px',
  backgroundColor: '#1e293b',
  borderRadius: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  border: '1px solid #334155'
};

const logoCircle = {
  width: '60px',
  height: '60px',
  backgroundColor: '#F97316',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px'
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#94a3b8',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
};

const inputStyle = { 
  padding: '14px', 
  borderRadius: '12px', 
  border: '2px solid #334155', 
  fontSize: '1rem',
  backgroundColor: '#0f172a',
  color: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const btnStyle = { 
  background: '#F97316', 
  color: 'white', 
  border: 'none', 
  padding: '16px', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  fontWeight: '900',
  fontSize: '1rem',
  marginTop: '10px',
  boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)'
};

const switchBtnStyle = { 
  background: 'none', 
  border: 'none', 
  color: '#94a3b8', 
  marginTop: '25px', 
  cursor: 'pointer', 
  width: '100%',
  fontSize: '0.9rem',
  fontWeight: '600'
};