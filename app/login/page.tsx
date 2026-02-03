'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getFromLocal } from '@/lib/store';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Email ou Pseudo
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      // --- INSCRIPTION ---
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { 
          data: { 
            username: identifier,
            prenom: '',
            nom: ''
          } 
        }
      });

      if (error) {
        alert(error.message);
      } else {
        // Sauvegarde locale pour le mappage Pseudo -> Email
        const users = (getFromLocal('users') || []) as any[];
        localStorage.setItem('users', JSON.stringify([...users, { username: identifier, email: email }]));
        
        alert("Compte créé ! Vérifiez vos e-mails.");
        setIsRegister(false);
      }
    } else {
      // --- CONNEXION HYBRIDE ---
      let loginEmail = identifier;

      // Si pas de @, on cherche l'email correspondant au pseudo dans le store local
      if (!identifier.includes('@')) {
        const users = (getFromLocal('users') || []) as any[];
        const foundUser = users.find(u => u.username?.toLowerCase() === identifier.toLowerCase());
        
        if (foundUser) {
          loginEmail = foundUser.email;
        } else if (identifier.toLowerCase() === 'admin') {
          loginEmail = 'anthony.didier.prop@gmail.com'; 
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        alert("Identifiants incorrects ou compte non vérifié ❌");
      } else if (data?.user) {
        const meta = data.user.user_metadata;
        
        // Stockage complet pour le Layout et le Dashboard
        localStorage.setItem('currentUser', JSON.stringify({ 
          username: meta?.username || identifier,
          prenom: meta?.prenom || '',
          nom: meta?.nom || '',
          email: data.user.email
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
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            {isRegister ? 'Créer mon compte' : 'Se connecter'}
          </p>
        </div>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>{isRegister ? "Nom d'utilisateur" : "Email ou Pseudo"}</label>
            <input 
              placeholder={isRegister ? "Ex: Jordan23" : "votre@email.com ou pseudo"} 
              style={inputStyle}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div style={inputGroup}>
              <label style={labelStyle}>Adresse Email</label>
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
            {loading ? "CHARGEMENT..." : (isRegister ? "CRÉER MON COMPTE" : "SE CONNECTER")}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} style={switchBtnStyle}>
          {isRegister ? "Déjà membre ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous ici"}
        </button>
      </div>
    </main>
  );
}

// --- RESTAURATION DES STYLES ---
const loginWrapper: React.CSSProperties = { 
  display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw',
  backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px'
};

const loginCard: React.CSSProperties = { 
  width: '90%', maxWidth: '450px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155'
};

const logoCircle = {
  width: '60px', height: '60px', backgroundColor: '#F97316', borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
};

const inputGroup = { display: 'flex', flexDirection: 'column' as const, gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '2px solid #334155', fontSize: '1rem', backgroundColor: '#0f172a', color: '#fff', outline: 'none' };
const btnStyle = { background: '#F97316', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)' };
const switchBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '25px', cursor: 'pointer', width: '100%', fontSize: '0.9rem', fontWeight: '600' };