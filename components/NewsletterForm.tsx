// components/NewsletterForm.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Ajustez le chemin selon votre structure

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ email }]);

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        setMessage('✅ Vous êtes déjà inscrit !');
      } else {
        setMessage('❌ Erreur : ' + error.message);
      }
    } else {
      setMessage('🎉 Merci de votre inscription !');
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '10px',
      background: 'rgba(255,255,255,0.05)',
      padding: '15px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>Newsletter Dunkly</h3>
      <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>Restez informé des actualités.</p>
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre.email@exemple.com"
        required
        style={{ 
          padding: '10px', 
          borderRadius: '8px', 
          border: 'none',
          outline: 'none',
          fontSize: '0.85rem'
        }}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          padding: '10px', 
          background: loading ? '#A1A1AA' : '#F97316', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem'
        }}
      >
        {loading ? 'Inscription...' : 'S\'abonner'}
      </button>

      {message && (
        <p style={{ 
          margin: 0, 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          color: message.startsWith('❌') ? '#EF4444' : '#22C55E',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </form>
  );
}