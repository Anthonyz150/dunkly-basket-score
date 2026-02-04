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
      const { data: existing } = await supabase.from('membres').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
      if (existing) throw new Error("Cet email est déjà utilisé.");

      const { data, error: insError } = await supabase
        .from('membres')
        .insert([{ email: email.toLowerCase().trim(), password, role: 'membre' }])
        .select().single();

      if (insError) throw insError;

      localStorage.setItem('currentUser', JSON.stringify(data));
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>DUNKLY</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>Créer un compte</p>
      
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={formStyle}>
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
          {loading ? 'Création...' : "S'inscrire"}
        </button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        Déjà inscrit ? <Link href="/login" style={{ color: '#F97316' }}>Se connecter</Link>
      </p>
    </div>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' };
const titleStyle = { fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' };
const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '10px', width: '300px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' };
const btnStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' as const };