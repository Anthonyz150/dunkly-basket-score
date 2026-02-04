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
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        {/* Section Logo & Titre */}
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

// --- STYLES DUNKLY (Basés sur l'image 2) ---

const pageWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#0f172a', // Fond bleu très sombre
  margin: 0,
};

const cardStyle = {
  backgroundColor: '#1e293b', // Couleur de la carte
  padding: '40px',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  textAlign: 'center' as const,
};

const headerStyle = { marginBottom: '30px' };

const logoIconStyle = {
  fontSize: '32px',
  backgroundColor: '#f97316',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 10px',
};

const titleStyle = { 
  fontSize: '2.5rem', 
  fontWeight: '900', 
  color: '#fff', 
  margin: 0, 
  letterSpacing: '2px',
  fontFamily: 'Arial Black, sans-serif'
};

const subtitleStyle = { 
  color: '#94a3b8', 
  fontSize: '14px', 
  marginTop: '5px' 
};

const formStyle = { 
  display: 'flex', 
  flexDirection: 'column' as const, 
  gap: '20px' 
};

const inputGroupStyle = { textAlign: 'left' as const };

const labelStyle = { 
  display: 'block', 
  color: '#94a3b8', 
  fontSize: '12px', 
  marginBottom: '8px', 
  fontWeight: 'bold' as const 
};

const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #334155', 
  backgroundColor: '#0f172a', 
  color: '#fff', 
  fontSize: '1rem',
  boxSizing: 'border-box' as const
};

const btnStyle = { 
  padding: '14px', 
  borderRadius: '10px', 
  border: 'none', 
  backgroundColor: '#f97316', 
  color: '#fff', 
  fontSize: '0.9rem', 
  cursor: 'pointer', 
  fontWeight: '900' as const,
  marginTop: '10px'
};

const errorStyle = { 
  color: '#ef4444', 
  fontSize: '13px', 
  marginBottom: '15px',
  fontWeight: 'bold' as const 
};

const footerTextStyle = { 
  marginTop: '25px', 
  color: '#94a3b8', 
  fontSize: '13px' 
};

const linkStyle = { 
  color: '#fff', 
  textDecoration: 'none', 
  fontWeight: 'bold' as const 
};