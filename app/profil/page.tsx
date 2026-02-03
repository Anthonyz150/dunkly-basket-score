"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // On récupère les infos déjà stockées si elles existent
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setUser(session.user);
      setPrenom(storedUser.prenom || '');
      setNom(storedUser.nom || '');
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
      prenom: prenom,
      nom: nom,
      username: prenom ? `${prenom} ${nom}` : user.email.split('@')[0]
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setMessage('✅ Profil mis à jour avec succès !');
    
    // On efface le message après 3 secondes
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>🏀 Chargement...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>Mon Profil <span style={{ color: '#F97316' }}>.</span></h1>
      <p style={{ color: '#64748B', marginBottom: '30px' }}>Gérez vos informations personnelles</p>

      {message && (
        <div style={{ padding: '15px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={inputGroup}>
          <label style={labelStyle}>Email (non modifiable)</label>
          <input type="text" value={user?.email} disabled style={{ ...inputStyle, backgroundColor: '#F8FAFC', cursor: 'not-allowed' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Prénom</label>
            <input 
              type="text" 
              value={prenom} 
              onChange={(e) => setPrenom(e.target.value)} 
              placeholder="Ex: Michael"
              style={inputStyle} 
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Nom</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              placeholder="Ex: Jordan"
              style={inputStyle} 
            />
          </div>
        </div>

        <button type="submit" style={btnSave}>SAUVEGARDER LES MODIFICATIONS</button>
      </form>
    </div>
  );
}

// Styles
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' as const };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '1rem', outline: 'none' };
const btnSave = { background: '#F97316', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', marginTop: '10px' };