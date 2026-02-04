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
      <div style={authCard}>
        <div style={logoSection}>
          <span style={{ fontSize: '3rem' }}>🏀</span>
          <h1 style={titleStyle}>DUNKLY <span style={{ color: '#F97316' }}>.</span></h1>
          <p style={subtitleStyle}>Rejoignez la communauté.</p>
        </div>

        {error && <div style={errorBadge}>{error}</div>}

        <form onSubmit={handleRegister} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>ADRESSE E-MAIL</label>
            <input type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>MOT DE PASSE</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
          </button>
        </form>
        <p style={footerText}>Déjà inscrit ? <Link href="/login" style={linkStyle}>Se connecter</Link></p>
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif', padding: '20px' };
const authCard = { backgroundColor: 'white', padding: '50px 40px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', textAlign: 'center' as const };
const logoSection = { marginBottom: '40px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '900', color: '#1E293B', margin: '10px 0 5px 0', letterSpacing: '-1px' };
const subtitleStyle = { color: '#64748B', fontSize: '0.95rem' };
const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '25px', textAlign: 'left' as const };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.7rem', fontWeight: '900', color: '#94A3B8', letterSpacing: '1px' };
const inputStyle = { padding: '16px', borderRadius: '14px', border: '2px solid #F1F5F9', fontSize: '1rem', outline: 'none', backgroundColor: '#F8FAFC' };
const submitBtn = { backgroundColor: '#1E293B', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px' };
const errorBadge = { backgroundColor: '#FEF2F2', color: '#DC2626', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '25px', border: '1px solid #FEE2E2' };
const footerText = { marginTop: '30px', color: '#64748B', fontSize: '0.9rem' };
const linkStyle = { color: '#F97316', fontWeight: 'bold', textDecoration: 'none' };