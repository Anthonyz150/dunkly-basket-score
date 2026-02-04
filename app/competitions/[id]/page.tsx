'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DetailCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const compId = resolvedParams.id;
  const router = useRouter();

  const [competition, setCompetition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    chargerCompetition();
  }, [compId]);

  const chargerCompetition = async () => {
    const { data, error } = await supabase
      .from('competitions') // Assure-toi que ta table s'appelle bien ainsi
      .select('*')
      .eq('id', compId)
      .single();

    if (data) setCompetition(data);
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'anthony.didier.pro@gmail.com';

  const modifierComp = async () => {
    const nouveauNom = prompt("Nom de la compétition :", competition.nom);
    if (nouveauNom && nouveauNom.trim() !== "" && nouveauNom !== competition.nom) {
      const { error } = await supabase
        .from('competitions')
        .update({ nom: nouveauNom.trim() })
        .eq('id', compId);

      if (!error) setCompetition({ ...competition, nom: nouveauNom.trim() });
    }
  };

  if (loading) return <div style={containerStyle}>Chargement...</div>;
  if (!competition) return <div style={containerStyle}>Compétition introuvable.</div>;

  return (
    <div style={containerStyle}>
      <button onClick={() => router.push('/competitions')} style={backBtn}>← Retour aux compétitions</button>

      <div style={headerCard}>
        <div style={iconStyle}>🏆</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {competition.nom}
            {isAdmin && <span onClick={modifierComp} style={{ cursor: 'pointer', fontSize: '1rem' }}>✏️</span>}
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>ID Officiel: {competition.id.split('-')[0]}</p>
        </div>
      </div>

      <div style={contentCard}>
        <h3 style={sectionTitle}>Informations Générales</h3>
        <p><strong>Type :</strong> {competition.type || 'Non défini'}</p>
        <p><strong>Saison :</strong> {competition.saison || '2025-2026'}</p>
        <hr style={hrStyle} />
        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
          Les matchs liés à cette compétition apparaîtront ici prochainement.
        </p>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' };
const backBtn = { background: '#f1f5f9', border: 'none', color: '#64748b', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' as const, marginBottom: '20px' };
const headerCard = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const iconStyle = { fontSize: '3rem', background: '#fff7ed', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid #ffedd5' };
const contentCard = { background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const sectionTitle = { margin: '0 0 20px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' as const };
const hrStyle = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' };