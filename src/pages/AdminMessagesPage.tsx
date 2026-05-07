import { useEffect, useState } from 'react';
import api from '../services/api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      setStatus("Accès refusé ou erreur serveur.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (id: number) => {
    try {
      await api.delete(`/contact/${id}`);
      setStatus('Message supprimé avec succès.');
      fetchMessages();
    } catch (err) {
      console.error(err);
      setStatus('Erreur lors de la suppression.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Messages reçus</h2>

      {status && <p style={{ textAlign: 'center', color: '#f06d06' }}>{status}</p>}

      {messages.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Aucun message.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              border: '1px solid #ccc',
              padding: '15px',
              marginBottom: '12px',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <p><strong>Nom :</strong> {msg.name}</p>
            <p><strong>Email :</strong> {msg.email}</p>
            <p><strong>Message :</strong> {msg.message}</p>
            <p><strong>Date :</strong> {new Date(msg.createdAt).toLocaleString()}</p>

            <button onClick={() => deleteMessage(msg.id)}>
              Supprimer
            </button>
          </div>
        ))
      )}
    </div>
  );
}