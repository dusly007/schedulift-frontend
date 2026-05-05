import { useState } from 'react';
import axios from 'axios';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3005/contact', form, { withCredentials: true });
      setStatus('Message envoyé avec succès !');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('Erreur lors de l’envoi du message.');
    }
  };

  const inputStyle = { width: '100%', padding: '8px', margin: '6px 0', borderRadius: '4px', border: '1px solid #ccc' };
  const buttonStyle = { padding: '10px 20px', marginTop: '10px', backgroundColor: '#f06d06', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Contactez-nous</h2>
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
      {status && <p style={{ textAlign: 'center', marginTop: '10px' }}>{status}</p>}
    </div>
  );
}