import { useState } from 'react';
import api from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contact', form);
      setStatus('Merci ! Votre message a été envoyé.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('Erreur lors de l’envoi du message.');
    }
  };

  const inputStyle = { width: '100%', padding: '8px', margin: '6px 0', borderRadius: '4px', border: '1px solid #ccc' };
  const buttonStyle = { padding: '10px 20px', marginTop: '10px', backgroundColor: '#f47c20', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const containerStyle = { maxWidth: '500px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>Besoin d'aide ?</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Vous pouvez nous envoyer un message ou nous contacter directement au 📞 <strong>1-514-566-2188</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <label>Nom :</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          minLength={3}
          style={inputStyle}
        />

        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Message :</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          minLength={5}
          style={{ ...inputStyle, height: '100px' }}
        />

        <button type="submit" style={buttonStyle}>Envoyer</button>
      </form>

      {status && <p style={{ textAlign: 'center', marginTop: '10px', color: status.includes('Merci') ? 'green' : 'red' }}>{status}</p>}
    </div>
  );
}