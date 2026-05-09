import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('courseId');
  const groupeId = searchParams.get('groupeId');

  const [amount, setAmount] = useState(10); // montant par défaut
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (groupeId) {
      // si tu as un endpoint pour récupérer le prix réel du groupe
      // api.get(`/groupes/${groupeId}`).then(res => setAmount(res.data.price))
    }
  }, [groupeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId || !groupeId) {
      setStatus('CourseId ou GroupeId manquant');
      return;
    }

    if (!user) {
      setStatus('Utilisateur non connecté');
      return;
    }

    try {
      const payload = {
        courseId: parseInt(courseId),
        groupeId: parseInt(groupeId),
        userId: user.id,
        amount,
        expiry: paymentInfo.expiry,
        cardNumber: paymentInfo.cardNumber,
        cvv: paymentInfo.cvv,
      };

      await api.post('/payment', payload);

      setStatus('Paiement effectué avec succès !');

      // après succès, revenir sur la page du groupe pour réserver
      navigate(`/groupes?courseId=${courseId}`, { replace: true });
    } catch (err: any) {
      setStatus(err.response?.data?.message || 'Erreur paiement');
    }
  };

  if (!user) return <p>Chargement utilisateur...</p>;

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Paiement du groupe</h2>
      <form onSubmit={handleSubmit}>
        <label>Numéro de carte</label>
        <input
          name="cardNumber"
          type="text"
          value={paymentInfo.cardNumber}
          onChange={handleChange}
          required
        />

        <label>Expiration</label>
        <input
          name="expiry"
          type="date"
          value={paymentInfo.expiry}
          onChange={handleChange}
          required
        />

        <label>CVV</label>
        <input
          name="cvv"
          type="text"
          value={paymentInfo.cvv}
          onChange={handleChange}
          required
        />

        <label>Montant</label>
        <input type="number" value={amount} readOnly style={{ marginBottom: '10px' }} />

        <button type="submit" style={{ marginTop: '10px', padding: '8px 16px' }}>Payer</button>
      </form>

      {status && (
        <p style={{ marginTop: '10px', color: status.includes('succès') ? 'green' : 'red' }}>
          {status}
        </p>
      )}
    </div>
  );
}