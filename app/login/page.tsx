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
    <div style={containerStyle}>
      <h1 style={titleStyle}>DUNKLY</h1>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={formStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        Pas de compte ? <Link href="/register" style={{ color: '#F97316' }}>S'inscrire</Link>
      </p>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  fontFamily: 'sans-serif',
  backgroundColor: '#fff'
};

const titleStyle = { fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' };

const formStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
  width: '300px'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const btnStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#111827',
  color: '#fff',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold' as const
};