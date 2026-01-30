'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFromLocal, saveToLocal } from '@/lib/store';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getFromLocal('users') || [];

    if (isRegister) {
      // INSCRIPTION
      if (users.find((u: any) => u.username === username)) {
        return alert("Cet utilisateur existe déjà !");
      }
      const newUsers = [...users, { username, password }];
      saveToLocal('users', newUsers);
      alert("Compte créé ! Connectez-vous.");
      setIsRegister(false);
    } else {
      // CONNEXION
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        router.push('/');
        router.refresh();
      } else {
        alert("Identifiants incorrects ❌");
      }
    }
  };

  return (
    <main style={loginContainer}>
      <div className="card" style={{ width: '350px', padding: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', textAlign: 'center' }}>🏀 BasketApp</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
          {isRegister ? 'Crée ton compte' : 'Connexion à ton espace'}
        </p>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Nom d'utilisateur" 
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={btnStyle}>
            {isRegister ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: 'none', border: 'none', color: '#e65100', marginTop: '20px', cursor: 'pointer', width: '100%' }}
        >
          {isRegister ? "Déjà un compte ? Connecte-toi" : "Pas de compte ? Inscris-toi"}
        </button>
      </div>
    </main>
  );
}

const loginContainer: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const btnStyle = { background: '#e65100', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };