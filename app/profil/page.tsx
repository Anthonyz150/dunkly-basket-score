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

      // 1. Récupérer les infos du localStorage
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // 2. Récupérer les infos depuis Supabase (priorité si le local est vide)
      const meta = session.user.user_metadata;
      
      setUser(session.user);
      setPrenom(storedUser.prenom || meta?.prenom || '');
      setNom(storedUser.nom || meta?.nom || '');
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('⏳ Enregistrement...');

    // Mise à jour des métadonnées dans Supabase
    const { error } = await supabase.auth.updateUser({
      data: { 
        prenom: prenom,
        nom: nom 
      }
    });

    if (error) {
      setMessage('❌ Erreur lors de la sauvegarde');
      return;
    }

    // Mise à jour du LocalStorage
    const currentData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentData,
      prenom: prenom,
      nom: nom,
      // Le username reste le pseudo d'origine, mais on peut choisir d'afficher Prénom Nom ailleurs
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // CRUCIAL : Déclenche l'alerte pour que le Layout.tsx se mette à jour immédiatement
    window.dispatchEvent(new Event('storage'));

    setMessage('✅ Profil mis à jour avec succès !');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: '3rem' }} className="bounce">🏀</div>
      <style jsx>{`.bounce { animation: bounce 0.6s infinite alternate; } @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-20px); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
          Mon Profil <span style={{ color: '#F97316' }}>.</span>
        </h1>
        <p style={{ color: '#64748B', marginTop: '5px' }}>
          Gérez vos informations et votre identité Dunkly.
        </p>
      </header>

      {message && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: message.includes('✅') ? '#DCFCE7' : '#FEE2E2', 
          color: message.includes('✅') ? '#166534' : '#991B1B', 
          borderRadius: '12px', 
          marginBottom: '20px', 
          fontWeight: '700',
          border: '1px solid'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '25px', 
        backgroundColor: 'white', 
        padding: '35px', 
        borderRadius: '28px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
        border: '1px solid #F1F5F9'
      }}>
        <div style={inputGroup}>
          <label style={labelStyle}>Adresse E-mail</label>
          <input 
            type="text" 
            value={user?.email} 
            disabled 
            style={{ ...inputStyle, backgroundColor: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed', border: '1px solid #E2E8F0' }} 
          />
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '5px' }}>L'email ne peut pas être modifié.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Prénom</label>
            <input 
              type="text" 
              value={prenom} 
              onChange={(e) => setPrenom(e.target.value)} 
              placeholder="Michael"
              style={inputStyle} 
              required
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Nom</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              placeholder="Jordan"
              style={inputStyle} 
              required
            />
          </div>
        </div>

        <button type="submit" style={btnSave}>
          SAUVEGARDER LES MODIFICATIONS
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '20px', borderRadius: '18px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', textAlign: 'center' }}>
          Ces informations seront visibles par les administrateurs et sur vos feuilles de match.
        </p>
      </div>
    </div>
  );
}

// Styles
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const inputStyle = { 
  padding: '14px', 
  borderRadius: '12px', 
  border: '2px solid #F1F5F9', 
  fontSize: '1rem', 
  outline: 'none',
  transition: 'border-color 0.2s',
  color: '#1E293B',
  fontWeight: '500'
};
const btnSave = { 
  background: '#F97316', 
  color: 'white', 
  border: 'none', 
  padding: '16px', 
  borderRadius: '14px', 
  cursor: 'pointer', 
  fontWeight: '900', 
  fontSize: '0.95rem',
  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
  marginTop: '10px'
};