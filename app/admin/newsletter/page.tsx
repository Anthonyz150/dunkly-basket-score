"use client";

import { useState } from 'react';

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('⏳ Envoi en cours...');

    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });

      if (response.ok) {
        setMessage('✅ Newsletter envoyée à tous les abonnés !');
        setSubject('');
        setBody('');
      } else {
        setMessage('❌ Erreur lors de l\'envoi.');
      }
    } catch (error) {
      setMessage('❌ Erreur technique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Administration - Newsletter</h1>
      <form onSubmit={handleSendNewsletter} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Objet de l'e-mail"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="Contenu de l'e-mail (HTML autorisé)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={10}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'monospace' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', background: '#F97316', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Envoi...' : 'Envoyer à tous les abonnés'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}