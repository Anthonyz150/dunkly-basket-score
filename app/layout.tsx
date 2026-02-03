'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [nom, setNom] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) setUser(JSON.parse(stored));
    fetchComps();
  }, []);

  const fetchComps = async () => {
    const { data } = await supabase.from('competitions').select('*').order('created_at', { ascending: false });
    if (data) setCompetitions(data);
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const ajouter = async () => {
    if (!nom || !isAdmin) return;
    const { error } = await supabase.from('competitions').insert([{ nom: nom.trim(), type: 'Championnat' }]);
    if (!error) { setNom(''); fetchComps(); }
    else alert(error.message);
  };

  return (
    <div>
      <h1>🏆 COMPÉTITIONS</h1>
      {isAdmin && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du tournoi" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button onClick={ajouter} style={{ background: '#F97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Ajouter</button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {competitions.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '15px', borderLeft: '5px solid #F97316', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0 }}>{c.nom}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>📅 {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const navGroup = { marginTop: '25px', marginBottom: '10px' };
const groupLabel = { fontSize: '0.7rem', color: '#4b5563', marginLeft: '20px', fontWeight: 'bold' as const, marginBottom: '8px' };