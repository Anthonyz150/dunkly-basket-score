'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getFromLocal } from '@/lib/store';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Peut être Email OU Username
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      // --- INSCRIPTION ---
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: identifier } }
      });
      if (error) alert(error.message);
      else {
        alert("Compte créé !");
        setIsRegister(false);
      }
    } else {
      // --- CONNEXION (Email ou Username) ---
      let loginEmail = identifier;

      // Si l'identifiant ne contient pas de "@", c'est un nom d'utilisateur
      // On va chercher l'email correspondant dans notre liste locale/base
      if (!identifier.includes('@')) {
        const users = (getFromLocal('users') || []) as any[];
        const foundUser = users.find(u => u.username?.toLowerCase() === identifier.toLowerCase());
        
        if (foundUser && foundUser.email) {
          loginEmail = foundUser.email;
        } else if (identifier.toLowerCase() === 'admin') {
          // Sécurité pour ton compte admin si non listé en local
          loginEmail = 'anthony.didier.prop@gmail.com'; 
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        alert("Identifiants incorrects ❌");
      } else if (data?.user) {
        // On récupère le nom propre
        const userDisplayName = data.user.user_metadata?.username || identifier;
        
        // Mise à jour immédiate du localStorage pour l'Admin et le Layout
        localStorage.setItem('currentUser', JSON.stringify({ 
          username: userDisplayName 
        }));

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
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', margin: '10px 0 5px' }}>
              DUNKLY <span style={{ color: '#F97316' }}>APP</span>
            </h1>
            <p style={{ color: '#94a3b8' }}>{isRegister ? 'Création de compte' : 'Connexion'}</p>
        </div>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email ou Nom d'utilisateur</label>
            <input 
              placeholder="Ex: jordan23 ou mike@mail.com" 
              style={inputStyle}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div style={inputGroup}>
              <label style={labelStyle}>Adresse Email réelle</label>
              <input 
                type="email"
                placeholder="votre@email.com" 
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
              placeholder="••••••••" 
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "PATIENTEZ..." : (isRegister ? "S'INSCRIRE" : "SE CONNECTER")}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} style={switchBtnStyle}>
          {isRegister ? "Déjà membre ? Connexion" : "Pas de compte ? Inscrivez-vous"}
        </button>
      </div>
    </main>
  );
}

// Styles inchangés...
const loginWrapper: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#0f172a' };
const loginCard: React.CSSProperties = { width: '90%', maxWidth: '450px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '24px', border: '1px solid #334155' };
const logoCircle = { width: '60px', height: '60px', backgroundColor: '#F97316', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' };
const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '2px solid #334155', backgroundColor: '#0f172a', color: '#fff' };
const btnStyle = { background: '#F97316', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' };
const switchBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '25px', cursor: 'pointer', width: '100%' };