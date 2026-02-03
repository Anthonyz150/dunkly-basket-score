"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
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

      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      setUser(session.user);
      setUsername(storedUser.username || '');
      setPrenom(storedUser.prenom || '');
      setNom(storedUser.nom || '');
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('⏳ Enregistrement...');

    try {
      // Mise à jour de la table 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          prenom: prenom,
          nom: nom 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Mise à jour des métadonnées Auth
      await supabase.auth.updateUser({
        data: { prenom, nom, username }
      });

      // Mise à jour du LocalStorage
      const currentData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentData,
        username: username,
        prenom: prenom,
        nom: nom,
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      setMessage('✅ Profil mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Erreur : ' + error.message);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: '3rem', animation: 'bounce 0.6s infinite alternate' }}>🏀</div>
      <style jsx>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-20px); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '15px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
          Mon Profil <span style={{ color: '#F97316' }}>.</span>
        </h1>
        <p style={{ color: '#64748B', marginTop: '5px' }}>Gérez votre identité Dunkly.</p>
      </header>

      {message && (
        <div style={{ 
          padding: '15px', backgroundColor: message.includes('✅') ? '#DCFCE7' : '#FEE2E2', 
          color: message.includes('✅') ? '#166534' : '#991B1B', borderRadius: '12px', 
          marginBottom: '20px', fontWeight: '700', border: '1px solid'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="profile-form">
        <div style={inputGroup}>
          <label style={labelStyle}>Pseudo (Nom d'utilisateur)</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="ex: MJ23"
            style={inputStyle} 
            required
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Adresse E-mail</label>
          <input type="text" value={user?.email} disabled style={disabledInput} />
        </div>

        {/* Grille responsive : 2 colonnes sur PC, 1 sur Mobile */}
        <div className="name-grid">
          <div style={inputGroup}>
            <label style={labelStyle}>Prénom</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle} required />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Nom</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} required />
          </div>
        </div>

        <button type="submit" style={btnSave}>SAUVEGARDER</button>

        <style jsx>{`
          .profile-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
            background-color: white;
            padding: 25px;
            border-radius: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.03);
            border: 1px solid #F1F5F9;
          }
          .name-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          @media (max-width: 480px) {
            .name-grid {
              grid-template-columns: 1fr; /* Passage en colonne seule sur mobile */
              gap: 15px;
            }
            .profile-form {
              padding: 20px;
            }
          }
        `}</style>
      </form>
    </div>
  );
}

// Styles inchangés mais optimisés pour l'import
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' as const };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', fontSize: '1rem', outline: 'none', color: '#1E293B', fontWeight: '500', boxSizing: 'border-box' as const };
const disabledInput = { ...inputStyle, backgroundColor: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' };
const btnSave = { background: '#F97316', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', cursor: 'pointer', fontWeight: '900', fontSize: '0.95rem', marginTop: '10px' };