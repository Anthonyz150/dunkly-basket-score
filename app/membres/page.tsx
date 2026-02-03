"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MembresPage() {
  const [membres, setMembres] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMembres = async () => {
      // 1. Vérification de sécurité Admin locale
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isAdmin = user?.username?.toLowerCase() === 'admin' || user?.role === 'admin';
      
      if (!isAdmin) {
        router.push('/');
        return;
      }

      // 2. Récupération des membres depuis la table 'profiles' de Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

      if (error) {
        console.error("Erreur Supabase:", error.message);
      } else {
        setMembres(data || []);
      }
      setLoading(false);
    };

    fetchMembres();
  }, [router]);

  const handleDelete = async (id: string, username: string) => {
    if (username === 'admin') return alert("Impossible de supprimer l'administrateur.");

    if (confirm(`Voulez-vous vraiment supprimer le membre "${username}" ?`)) {
      // Suppression dans Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
      } else {
        // Mise à jour de l'affichage local
        setMembres(membres.filter(m => m.id !== id));
      }
    }
  };

  const filteredMembres = membres.filter(m => 
    m.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>🏀 Chargement des membres...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>Gestion des <span style={{ color: '#F97316' }}>Membres</span></h1>
          <p style={{ color: '#64748B' }}>{membres.length} utilisateur(s) enregistré(s) en base</p>
        </div>
        <input 
          type="text" 
          placeholder="Rechercher (pseudo ou email)..." 
          style={searchStyle}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <div style={tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #F1F5F9' }}>
              <th style={thStyle}>PSEUDO</th>
              <th style={thStyle}>NOM COMPLET</th>
              <th style={thStyle}>EMAIL</th>
              <th style={thStyle}>RÔLE</th>
              <th style={thStyle}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembres.map((membre) => (
              <tr key={membre.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={tdStyle}><strong>{membre.username}</strong></td>
                <td style={tdStyle}>{membre.prenom} {membre.nom}</td>
                <td style={tdStyle}>{membre.email}</td>
                <td style={tdStyle}>
                  <span style={roleBadge(membre.role === 'admin' || membre.username === 'admin')}>
                    {membre.role === 'admin' || membre.username === 'admin' ? 'ADMIN' : 'MEMBRE'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => handleDelete(membre.id, membre.username)}
                    style={membre.username === 'admin' ? btnDisabled : deleteBtn}
                    disabled={membre.username === 'admin'}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembres.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Aucun membre ne correspond à votre recherche.</p>
        )}
      </div>
    </div>
  );
}

// Styles
const tableCard = { backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const thStyle = { padding: '15px', color: '#64748B', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' as const };
const tdStyle = { padding: '15px', fontSize: '0.9rem', color: '#1E293B' };
const searchStyle = { padding: '12px 20px', borderRadius: '12px', border: '2px solid #E2E8F0', width: '280px', outline: 'none' };
const deleteBtn = { backgroundColor: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const };
const btnDisabled = { ...deleteBtn, opacity: 0.3, cursor: 'not-allowed' };
const roleBadge = (isAdmin: boolean) => ({
  backgroundColor: isAdmin ? '#FFEDD5' : '#F1F5F9',
  color: isAdmin ? '#9A3412' : '#475569',
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '0.7rem',
  fontWeight: 'bold' as const
});