import { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<string>('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');

      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setStatus("Accès refusé ou erreur serveur.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: number, role: string) => {
    try {
      await api.patch(`/users/${id}/role`,
        { role },
        { withCredentials: true }
      );

      setStatus('Rôle modifié avec succès.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setStatus('Erreur modification rôle.');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setStatus('Utilisateur supprimé.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setStatus('Erreur suppression.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <h2>Gestion des utilisateurs</h2>

      {status && <p>{status}</p>}

      {users.map((user) => (
        <div
          key={user.id}
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '8px',
          }}
        >
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Rôle :</strong> {user.role}</p>

          <select
            value={user.role}
            onChange={(e) =>
              updateRole(user.id, e.target.value)
            }
          >
            <option value="client">client</option>
            <option value="coach">coach</option>
            <option value="admin">admin</option>
          </select>

          <button
            onClick={() => deleteUser(user.id)}
            style={{ marginLeft: '10px' }}
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}