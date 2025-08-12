// src/components/RequestForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  db,
  storage
} from '../config/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const RequestForm = () => {
  const { user, profile } = useAuth();

  // Payment instructions fields
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [bankEntity, setBankEntity] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');

  // optional attachments
  const [attachment1, setAttachment1] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // helper: formato SRV-0001
  const formatRequestId = (num) => `SRV-${String(num).padStart(4, '0')}`;

  // obtiene el siguiente número consecutivo de forma atómica usando una transacción
  const getNextConsecutive = async () => {
    const counterRef = doc(db, 'counters', 'serviceRequests');
    const nextNumber = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      if (!snap.exists()) {
        transaction.set(counterRef, { lastNumber: 1 });
        return 1;
      }
      const lastNumber = snap.data().lastNumber || 0;
      const newNumber = lastNumber + 1;
      transaction.update(counterRef, { lastNumber: newNumber });
      return newNumber;
    });
    return nextNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError('You must be logged in to create a service request.');
      return;
    }

    setLoading(true);
    try {
      // 1) sacar siguiente consecutivo
      const nextNum = await getNextConsecutive();
      const requestId = formatRequestId(nextNum);

      // 2) crear documento en Firestore con ID requestId
      const reqRef = doc(db, 'serviceRequests', requestId);

      // preparar objeto de paymentInstructions
      const paymentInstructions = {
        account,
        amount: Number(amount) || 0,
        requiredDate, // guardamos como string (ISO yyyy-mm-dd) — o puedes convertir a Timestamp si prefieres
        pickupAddress,
        deliveryAddress,
        bankEntity,
        beneficiaryId
      };

      // 3) subir attachment1 (si existe) a Storage y obtener URL
      let attachment1Url = null;
      if (attachment1) {
        const fileRef = ref(storage, `serviceRequests/${requestId}/attachment1_${attachment1.name}`);
        await uploadBytes(fileRef, attachment1);
        attachment1Url = await getDownloadURL(fileRef);
      }

      // 4) guardar documento
      const data = {
        requestId,
        userId: user.uid,
        userName: profile?.name || user.email || '',
        requestDate: serverTimestamp(),
        paymentInstructions,
        attachment1: attachment1Url,
        attachment2: null, // provider will add later
        status: 'Pending', // initial status
        assignedProviderId: null,
        assignedProviderName: null,
        lastUpdated: serverTimestamp()
      };

      await setDoc(reqRef, data);

      // success
      setMessage(`Request ${requestId} created successfully.`);
      // limpiar formulario
      setAccount('');
      setAmount('');
      setRequiredDate('');
      setPickupAddress('');
      setDeliveryAddress('');
      setBankEntity('');
      setBeneficiaryId('');
      setAttachment1(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  // Si no hay usuario logueado, mostramos invitación a loguearse
  if (!user) {
    return (
      <div style={{ maxWidth: 700, margin: 'auto' }}>
        <p>Please log in to create a service request.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>Create Service Request</h2>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={loading} style={{ border: 'none', padding: 0 }}>
          <div>
            <label>Account</label>
            <input value={account} onChange={(e) => setAccount(e.target.value)} required />
          </div>

          <div>
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div>
            <label>Required Date</label>
            <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} required />
          </div>

          <div>
            <label>Pickup Address</label>
            <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} required />
          </div>

          <div>
            <label>Delivery Address</label>
            <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
          </div>

          <div>
            <label>Bank Entity</label>
            <input value={bankEntity} onChange={(e) => setBankEntity(e.target.value)} />
          </div>

          <div>
            <label>Beneficiary ID</label>
            <input value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)} />
          </div>

          <div>
            <label>Attachment (optional)</label>
            <input type="file" onChange={(e) => setAttachment1(e.target.files?.[0] || null)} />
          </div>

          <div style={{ marginTop: 10 }}>
            <button type="submit">{loading ? 'Creating...' : 'Create Request'}</button>
          </div>
        </fieldset>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
