'use client';
import { useState, useEffect } from 'react';
import { getFromLocal, saveToLocal } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ username: '', password: '' });
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (storedUser.username !== 'admin') {
      router.push('/');
      return;
    }
    setUsers(getFromLocal('users') || []);
  }, [router]);

  const supprimerUser = (usernameToDelete: string) => {
    if (usernameToDelete === 'admin') return alert("Impossible de supprimer l'admin !");
    
    if (confirm(`Voulez-vous vraiment supprimer ${usernameToDelete} ?`)) {
      // CORRECTION ICI : Ajout de : any[]
      const currentUsers: any[] = getFromLocal('users') || [];
      const nouvelleListe = currentUsers.filter((u: any) => u.username !== usernameToDelete);
      saveToLocal('users', nouvelleListe);
      setUsers(nouvelleListe);
    }
  };

  const preparerEdition = (user: any) => {
    setEditingUser(user.username);
    setEditForm({ username: user.username, password: user.password });
  };

  const sauvegarderEdition = (oldUsername: string) => {
    if (!editForm.username) return alert("Pseudo requis");
    
    // CORRECTION ICI : Ajout de : any[]
    const currentUsers: any[] = getFromLocal('users') || [];
    const nouvelleListe = currentUsers.map((u: any) => 
      u.username === oldUsername ? { ...u, username: editForm.username, password: editForm.password } : u
    );

    saveToLocal('users', nouvelleListe);
    setUsers(nouvelleListe);
    setEditingUser(null);
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>👥 Administration</h1>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', color: 'white' }}>
              <th style={thStyle}>UTILISATEUR</th>
              <th style={thStyle}>MOT DE PASSE</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.username} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>
                  {editingUser === u.username ? (
                    <input 
                      style={editInputStyle} 
                      value={editForm.username} 
                      onChange={e => setEditForm({...editForm, username: e.target.value})}
                    />
                  ) : (
                    <strong>{u.username}</strong>
                  )}
                </td>
                <td style={tdStyle}>
                  {editingUser === u.username ? (
                    <input 
                      style={editInputStyle} 
                      value={editForm.password} 
                      onChange={e => setEditForm({...editForm, password: e.target.value})}
                    />
                  ) : (
                    <span style={{ color: '#ccc' }}>••••••••</span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {editingUser === u.username ? (
                      <>
                        <button onClick={() => sauvegarderEdition(u.username)} style={btnSaveStyle}>OK</button>
                        <button onClick={() => setEditingUser(null)} style={btnCancelStyle}>Annuler</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => preparerEdition(u)} style={btnEditStyle}>Modifier</button>
                        {u.username !== 'admin' && (
                          <button onClick={() => supprimerUser(u.username)} style={btnDeleteStyle}>Supprimer</button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLES 
const thStyle = { padding: '15px 20px', textAlign: 'left' as const, fontSize: '0.8rem' };
const tdStyle = { padding: '15px 20px' };
const editInputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #F97316', width: '120px' };
const btnEditStyle = { background: '#f0f0f0', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' };
const btnDeleteStyle = { background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' };
const btnSaveStyle = { background: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' };
const btnCancelStyle = { background: '#666', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' };