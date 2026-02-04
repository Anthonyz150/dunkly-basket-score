"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: insError } = await supabase
        .from('membres')
        .insert([{ email: email.toLowerCase().trim(), password, role: 'membre' }])
        .select().single();

      if (insError) throw insError;

      localStorage.setItem('currentUser', JSON.stringify(data));
      router.push('/');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={fullPageWrapper}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoIconStyle}>🏀</div>
          <h1 style={titleStyle}>DUNKLY</h1>
          <p style={subtitleStyle}>Créer un compte</p>
        </div>
        
        {error && <p style={errorStyle}>{error}</p>}
        
        <form onSubmit={handleRegister} style={formStyle}>
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
            {loading ? 'CRÉATION...' : "S'INSCRIRE"}
          </button>
        </form>
        
        <p style={footerTextStyle}>
          Déjà un compte ? <Link href="/login" style={linkStyle}>Connexion</Link>
        </p>
      </div>
    </main>
  );
}

// Copie exactement les mêmes objets "const" (fullPageWrapper, etc.) de la LoginPage ici.
const fullPageWrapper: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    // Correction du fond : Colonne centrale bleu nuit sur fond noir total
    backgroundColor: '#000',
    backgroundImage: 'linear-gradient(to right, transparent 40%, #0f172a 40%, #0f172a 60%, transparent 60%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  };
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#1e293b',
    padding: '50px 40px',
    borderRadius: '24px',
    width: '400px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 1)',
    textAlign: 'center',
    zIndex: 10,
  };
  
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
  
  const titleStyle: React.CSSProperties = { fontSize: '3rem', fontWeight: '900', color: '#fff', margin: 0, fontFamily: 'Arial Black, sans-serif' };
  const subtitleStyle = { color: '#94a3b8', fontSize: '14px', marginTop: '5px' };
  const headerStyle = { marginBottom: '30px' };
  const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
  const inputGroupStyle = { textAlign: 'left' as const };
  const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0d1117', color: '#fff', boxSizing: 'border-box' };
  const btnStyle: React.CSSProperties = { padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: '900' };
  const errorStyle = { color: '#ff4444', fontSize: '13px', marginBottom: '15px' };
  const footerTextStyle = { marginTop: '25px', color: '#94a3b8', fontSize: '14px' };
  const linkStyle = { color: '#fff', textDecoration: 'none', fontWeight: 'bold' };