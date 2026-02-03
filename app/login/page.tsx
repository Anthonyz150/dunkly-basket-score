'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: identifier } }
      });
      if (error) alert(error.message);
      else alert("Compte créé ! Vérifiez vos e-mails.");
      setIsRegister(false);
    } else {
      // CONNEXION DIRECTE AVEC SUPABASE
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier, // Utilise ton email complet ici
        password: password,
      });

      if (error) {
        alert("Identifiants incorrects ou email non vérifié ❌");
      } else {
        // Redirection vers l'accueil
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <main style={loginWrapper}>
      <div style={loginCard}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
           <div style={logoCircle}>🏀</div>
           <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', margin: '10px 0 5px' }}>DUNKLY</h1>
           <p style={{ color: '#94a3b8' }}>{isRegister ? 'Créer un compte' : 'Se connecter'}</p>
        </div>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>{isRegister ? "Pseudo" : "Email"}</label>
            <input 
              placeholder={isRegister ? "Jordan23" : "votre@email.com"} 
              style={inputStyle}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div style={inputGroup}>
              <label style={labelStyle}>Email</label>
              <input 
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          
          <div style={inputGroup}>
            <label style={labelStyle}>Mot de passe</label>
            <input 
              type="password" 
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "CHARGEMENT..." : (isRegister ? "S'INSCRIRE" : "SE CONNECTER")}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} style={switchBtnStyle}>
          {isRegister ? "Déjà membre ? Connexion" : "Pas de compte ? Inscription"}
        </button>
      </div>
    </main>
  );
}

// ... Styles identiques à ton précédent fichier (loginWrapper, loginCard, etc.) ...
const loginWrapper: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#0f172a' };
const loginCard: React.CSSProperties = { width: '90%', maxWidth: '450px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '24px', border: '1px solid #334155' };
const logoCircle = { width: '60px', height: '60px', backgroundColor: '#F97316', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '2px solid #334155', backgroundColor: '#0f172a', color: '#fff' };
const btnStyle = { background: '#F97316', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' };
const switchBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '25px', cursor: 'pointer', width: '100%' };