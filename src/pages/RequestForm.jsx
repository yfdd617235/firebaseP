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
    try {
      const nextNumber = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(counterRef);
        if (!snap.exists()) {
          console.log('Counter document does not exist, creating with lastNumber: 1');
          transaction.set(counterRef, { lastNumber: 1 });
          return 1;
        }
        const data = snap.data();
        if (!data.lastNumber || typeof data.lastNumber !== 'number') {
          console.warn(`Invalid lastNumber in counter: ${JSON.stringify(data)}`);
          throw new Error('Invalid counter data');
        }
        const lastNumber = data.lastNumber;
        const newNumber = lastNumber + 1;
        transaction.update(counterRef, { lastNumber: newNumber });
        return newNumber;
      });
      console.log(`Generated next number: ${nextNumber}`);
      return nextNumber;
    } catch (err) {
      console.error('Error in getNextConsecutive:', err);
      throw new Error(`Failed to generate request ID: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError('You must be logged in to create a service request.');
      return;
    }

    // Validar requiredDate
    let parsedRequiredDate = null;
    if (requiredDate) {
      const date = new Date(requiredDate);
      if (isNaN(date.getTime())) {
        setError('Invalid date format for Required Date');
        return;
      }
      parsedRequiredDate = date;
    } else {
      setError('Required Date is mandatory');
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
        requiredDate: parsedRequiredDate, // Guardar como Timestamp
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
      console.error('Error creating request:', err);
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
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className=" w-full lg:w-1/2 mx-auto p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Create Service Request</h2>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading} className="border-0 p-0 m-0">
            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Account</label>
                <input
                  className="border rounded px-3 py-2"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Required Date</label>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Pickup Address</label>
                <input
                  className="border rounded px-3 py-2"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Delivery Address</label>
                <input
                  className="border rounded px-3 py-2"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Bank Entity</label>
                <input
                  className="border rounded px-3 py-2"
                  value={bankEntity}
                  onChange={(e) => setBankEntity(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Beneficiary ID</label>
                <input
                  className="border rounded px-3 py-2"
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Attachment (optional)</label>
                <input
                  type="file"
                  className="border rounded px-3 py-2"
                  onChange={(e) => setAttachment1(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Botón abajo ocupando todo el ancho */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full border rounded px-4 py-2 font-medium"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </fieldset>
        </form>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>

  );
};