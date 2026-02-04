"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: user, error: fetchError } = await supabase
        .from('membres')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (fetchError || !user) throw new Error("Identifiants incorrects.");
      if (user.password !== password) throw new Error("Identifiants incorrects.");

      localStorage.setItem('currentUser', JSON.stringify(user));
      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={fullPageWrapper}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoIconStyle}>🏀</div>
          <h1 style={titleStyle}>DUNKLY</h1>
          <p style={subtitleStyle}>Se connecter</p>
        </div>
        
        {error && <p style={errorStyle}>{error}</p>}
        
        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </form>
        
        <p style={footerTextStyle}>
          Pas de compte ? <Link href="/register" style={linkStyle}>Inscription</Link>
        </p>
      </div>
    </div>
  );
}

// --- LES STYLES (CORRIGÉS POUR LE FOND) ---

const fullPageWrapper: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  // Ce dégradé crée la bande centrale bleu nuit sur fond noir (image 7a1aa7)
  background: 'linear-gradient(to right, #0a0a0a 0%, #0a0a0a 42%, #0f172a 42%, #0f172a 58%, #0a0a0a 58%, #0a0a0a 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1c2331',
  padding: '50px 40px',
  borderRadius: '24px',
  width: '420px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
  textAlign: 'center',
};

const headerStyle = { marginBottom: '35px' };

const logoIconStyle: React.CSSProperties = {
  fontSize: '28px',
  backgroundColor: '#f97316',
  width: '54px',
  height: '54px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 12px',
};

const titleStyle: React.CSSProperties = { 
  fontSize: '3.2rem', 
  fontWeight: '900', 
  color: '#fff', 
  margin: 0, 
  letterSpacing: '2px',
  fontFamily: 'Arial Black, sans-serif'
};

const subtitleStyle = { color: '#94a3b8', fontSize: '14px', marginTop: '5px' };

const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '22px' };

const inputGroupStyle = { textAlign: 'left' as const };

const labelStyle = { 
  display: 'block', 
  color: '#94a3b8', 
  fontSize: '12px', 
  marginBottom: '8px', 
  fontWeight: 'bold' 
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '13px', 
  borderRadius: '8px', 
  border: '1px solid #334155', 
  backgroundColor: '#0d1117', 
  color: '#fff', 
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = { 
  padding: '15px', 
  borderRadius: '10px', 
  border: 'none', 
  backgroundColor: '#f97316', 
  color: '#fff', 
  fontSize: '1rem', 
  cursor: 'pointer', 
  fontWeight: '900',
  marginTop: '10px'
};

const errorStyle = { color: '#ef4444', fontSize: '13px', marginBottom: '15px' };

const footerTextStyle = { marginTop: '25px', color: '#94a3b8', fontSize: '14px' };

const linkStyle = { color: '#fff', textDecoration: 'none', fontWeight: 'bold' };