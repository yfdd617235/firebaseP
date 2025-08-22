// import { useEffect, useState, useRef } from "react";
// import { db, storage } from "../config/firebase";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   updateDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { useAuth } from "../context/AuthContext";

// // ========= Helpers =========
// const formatDate = (dateInput) => {
//   let date;
//   if (dateInput?.seconds) {
//     date = new Date(dateInput.seconds * 1000);
//   } else if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
//     date = new Date(dateInput);
//   } else {
//     return "";
//   }
//   if (isNaN(date.getTime())) return "";
//   const day = String(date.getDate()).padStart(2, "0");
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const month = months[date.getMonth()];
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// const formatPaymentInstructions = (paymentInstructions) => {
//   if (!paymentInstructions) return "";
//   const {
//     account = "",
//     amount = 0,
//     requiredDate,
//     pickupAddress = "",
//     deliveryAddress = "",
//     bankEntity = "",
//     beneficiaryId = "",
//   } = paymentInstructions;
//   const formattedDate = formatDate(requiredDate);
//   return `Account: ${account}, Amount: ${amount}, Required Date: ${formattedDate}, Pickup Address: ${pickupAddress}, Delivery Address: ${deliveryAddress}, Bank Entity: ${bankEntity}, Beneficiary ID: ${beneficiaryId}`;
// };

// // =========================== COMPONENTE ===========================
// export const RequestsTable = () => {
//   const [requests, setRequests] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [providers, setProviders] = useState([]);

//   const { profile, loading } = useAuth();
//   const hasLogged = useRef(false);

//   if (loading) return <div>Loading profile...</div>;
//   if (!profile) return <div>No user profile available</div>;

//   const role = profile?.role || "client";
//   const currentUserId = profile?.uid;
//   const canEditStatus = role === "admin";
//   const canDelete = role === "admin";

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         let snapshot;

//         if (role === "client") {
//           const q = query(
//             collection(db, "serviceRequests"),
//             where("userId", "==", currentUserId)
//           );
//           snapshot = await getDocs(q);
//         } else if (role === "provider") {
//           const q = query(
//             collection(db, "serviceRequests"),
//             where("assignedProviderId", "==", currentUserId)
//           );
//           snapshot = await getDocs(q);
//         } else {
//           snapshot = await getDocs(collection(db, "serviceRequests"));
//         }

//         const userIds = [...new Set(snapshot.docs.map((d) => d.data().userId).filter(Boolean))];
//         let usersMap = {};
//         if (userIds.length > 0) {
//           const usersQuery = query(collection(db, "users"), where("uid", "in", userIds));
//           const usersSnapshot = await getDocs(usersQuery);
//           usersSnapshot.forEach((userDoc) => {
//             usersMap[userDoc.id] = userDoc.data().company || "";
//           });
//         }

//         const data = snapshot.docs.map((docSnap) => ({
//           id: docSnap.id,
//           ...docSnap.data(),
//           company: usersMap[docSnap.data().userId] || "Unknown",
//         }));

//         if (!hasLogged.current) {
//           console.log(`Fetched ${data.length} request(s) for ${role} with UID: ${currentUserId}`);
//           hasLogged.current = true;
//         }
//         setRequests(data);
//       } catch (error) {
//         console.error("Error fetching requests:", error);
//         setRequests([]);
//       }
//     };

//     const fetchProviders = async () => {
//       if (role !== "admin") return;
//       try {
//         const q = query(collection(db, "users"), where("role", "==", "provider"));
//         const snap = await getDocs(q);
//         const provs = snap.docs.map((d) => ({
//           uid: d.data().uid,
//           name: d.data().name || d.data().email,
//         }));
//         setProviders(provs);
//       } catch (err) {
//         console.error("Error fetching providers:", err);
//       }
//     };

//     fetchRequests();
//     fetchProviders();
//   }, [role, currentUserId]);

//   const handleFilterChange = (e, field) => {
//     setFilters({ ...filters, [field]: e.target.value });
//   };

//   const handleEdit = async (id, field, value) => {
//     const requestRef = doc(db, "serviceRequests", id);
//     await updateDoc(requestRef, { [field]: value });
//     setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, [field]: value } : req)));
//   };

//   const handleAssignProvider = async (id, providerId) => {
//     const provider = providers.find((p) => p.uid === providerId);
//     const requestRef = doc(db, "serviceRequests", id);
//     await updateDoc(requestRef, {
//       assignedProviderId: providerId || null,
//       assignedProviderName: provider?.name || null,
//     });
//     setRequests((prev) =>
//       prev.map((req) =>
//         req.id === id
//           ? {
//             ...req,
//             assignedProviderId: providerId || null,
//             assignedProviderName: provider?.name || null,
//           }
//           : req
//       )
//     );
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this request?")) return;
//     await deleteDoc(doc(db, "serviceRequests", id));
//     setRequests((prev) => prev.filter((req) => req.id !== id));
//   };

//   const handleUploadAttachment2 = async (id, file) => {
//     if (!file) return;
//     const fileRef = ref(storage, `serviceRequests/${id}/attachment2_${file.name}`);
//     await uploadBytes(fileRef, file);
//     const url = await getDownloadURL(fileRef);
//     await updateDoc(doc(db, "serviceRequests", id), { attachment2: url });
//     setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, attachment2: url } : req)));
//   };

//   const handleDownloadPDF = () => window.print();

//   const filteredRequests = requests.filter((req) =>
//     Object.entries(filters).every(([key, value]) => {
//       if (!value) return true;
//       return String(req[key] || "").toLowerCase().includes(value.toLowerCase());
//     })
//   );

//   const isProviderAssignedToRow = (req) =>
//     role === "provider" && req.assignedProviderId === currentUserId;

//   const getStatusClass = (status) => {
//     if (status?.toLowerCase() === "pending") return "text-yellow-800 font-bold";
//     if (status?.toLowerCase() === "completed") return "text-green-800 font-bold";
//     return "";
//   };

//   return (
//     <div className="p-5 min-h-screen">
//       {/* Filtros */}
//       <div className="bg-white fixed top-0 left-0 w-full z-50 p-2 no-print" style={{ top: "60px" }}>
//         <div className="flex flex-wrap gap-2 my-2">
//           {["requestId", "company", "userName", "status"].map((field) => (
//             <input
//               key={field}
//               placeholder={`Filter by ${field}`}
//               value={filters[field] || ""}
//               onChange={(e) => handleFilterChange(e, field)}
//               className="border rounded px-3 py-2 text-sm border-gray-300"
//             />
//           ))}
//           <button
//             onClick={handleDownloadPDF}
//             className="border rounded px-4 py-2 text-sm font-medium text-black hover:bg-blue-100"
//           >
//             Download
//           </button>
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="mt-42 overflow-x-auto border rounded-lg">
//         <table className="min-w-[1200px] w-full border-collapse table-auto">
//           <thead className="bg-gray-100 sticky top-0 z-40">
//             <tr>
//               <th className="border px-4 py-2 text-left">ID Request</th>
//               <th className="border px-4 py-2 text-left">Company</th>
//               <th className="border px-4 py-2 text-left">Client</th>
//               <th className="border px-4 py-2 text-left">Request Date</th>
//               <th className="border px-4 py-2 text-left">Status</th>
//               <th className="border px-4 py-2 text-left">Payment Instructions</th>
//               <th className="border px-4 py-2 text-left">Assigned Provider</th>
//               <th className="border px-4 py-2 text-left">Attachment 1</th>
//               <th className="border px-4 py-2 text-left">Attachment 2</th>
//               {canDelete && <th className="border px-4 py-2 text-left">Actions</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRequests.length === 0 ? (
//               <tr>
//                 <td colSpan={canDelete ? 10 : 9} className="border px-4 py-2 text-center">
//                   No hay solicitudes disponibles
//                 </td>
//               </tr>
//             ) : (
//               filteredRequests.map((req) => {
//                 const isCompleted = req.status?.toLowerCase() === "completed";
//                 return (
//                   <tr key={req.id} className="hover:bg-gray-50">
//                     <td className="border px-4 py-2">{req.requestId}</td>
//                     <td className="border px-4 py-2">{req.company}</td>
//                     <td className="border px-4 py-2">{req.userName}</td>
//                     <td className="border px-4 py-2">{formatDate(req.requestDate)}</td>
//                     <td className="border px-4 py-2">
//                       {canEditStatus ? (
//                         <select
//                           value={req.status || ""}
//                           onChange={(e) => handleEdit(req.id, "status", e.target.value)}
//                           className="border rounded px-2 py-1"
//                         >
//                           <option value="Pending">Pending</option>
//                           <option value="Approved">Approved</option>
//                           <option value="Completed">Completed</option>
//                         </select>
//                       ) : (
//                         <span className={getStatusClass(req.status)}>{req.status}</span>
//                       )}
//                     </td>

//                     <td className="border px-4 py-2">
//                       {formatPaymentInstructions(req.paymentInstructions)}
//                     </td>
//                     <td className="border px-4 py-2">
//                       {canEditStatus ? (
//                         <select
//                           value={req.assignedProviderId || ""}
//                           onChange={(e) => handleAssignProvider(req.id, e.target.value)}
//                           className="border rounded px-2 py-1"
//                         >
//                           <option value="">-- Select Provider --</option>
//                           {providers.map((p) => (
//                             <option key={p.uid} value={p.uid}>
//                               {p.name}
//                             </option>
//                           ))}
//                         </select>
//                       ) : (
//                         req.assignedProviderName || "Unassigned"
//                       )}
//                     </td>
//                     <td className="border px-4 py-2">
//                       {req.attachment1 && (
//                         <a
//                           href={req.attachment1}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-blue-600 hover:underline"
//                         >
//                           View
//                         </a>
//                       )}
//                     </td>
//                     <td className="border px-4 py-2">
//                       {req.attachment2 && (
//                         <a
//                           href={req.attachment2}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-blue-600 hover:underline"
//                         >
//                           View
//                         </a>
//                       )}
//                       {/* proveedor solo puede subir si está asignado y no está completed */}
//                       {role === "provider" && isProviderAssignedToRow(req) && !isCompleted && (
//                         <input
//                           type="file"
//                           onChange={(e) => handleUploadAttachment2(req.id, e.target.files[0])}
//                           className="mt-2"
//                         />
//                       )}
//                       {/* admin puede subir siempre */}
//                       {role === "admin" && (
//                         <input
//                           type="file"
//                           onChange={(e) => handleUploadAttachment2(req.id, e.target.files[0])}
//                           className="mt-2"
//                         />
//                       )}
//                     </td>
//                     {canDelete && (
//                       <td className="border px-4 py-2">
//                         <button
//                           onClick={() => handleDelete(req.id)}
//                           className="text-red-600 hover:underline"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     )}
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

import { useEffect, useState, useRef } from "react";
import { db, storage } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";

// ========= Helpers =========
const formatDate = (dateInput) => {
  let date;
  if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    date = new Date(dateInput);
  } else {
    return "";
  }
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatPaymentInstructions = (paymentInstructions) => {
  if (!paymentInstructions) return "";
  const {
    account = "",
    amount = 0,
    requiredDate,
    pickupAddress = "",
    deliveryAddress = "",
    bankEntity = "",
    beneficiaryId = "",
  } = paymentInstructions;
  const formattedDate = formatDate(requiredDate);
  return `Account: ${account}, Amount: ${amount}, Required Date: ${formattedDate}, Pickup Address: ${pickupAddress}, Delivery Address: ${deliveryAddress}, Bank Entity: ${bankEntity}, Beneficiary ID: ${beneficiaryId}`;
};

// =========================== COMPONENTE ===========================
export const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({});
  const [providers, setProviders] = useState([]);

  const { profile, loading } = useAuth();
  const hasLogged = useRef(false);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No user profile available</div>;

  const role = profile?.role || "client";
  const currentUserId = profile?.uid;
  const canEditStatus = role === "admin";
  const canDelete = role === "admin";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let snapshot;

        if (role === "client") {
          const q = query(
            collection(db, "serviceRequests"),
            where("userId", "==", currentUserId)
          );
          snapshot = await getDocs(q);
        } else if (role === "provider") {
          const q = query(
            collection(db, "serviceRequests"),
            where("assignedProviderId", "==", currentUserId)
          );
          snapshot = await getDocs(q);
        } else {
          snapshot = await getDocs(collection(db, "serviceRequests"));
        }

        const userIds = [...new Set(snapshot.docs.map((d) => d.data().userId).filter(Boolean))];
        let usersMap = {};
        if (userIds.length > 0) {
          const usersQuery = query(collection(db, "users"), where("uid", "in", userIds));
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.forEach((userDoc) => {
            usersMap[userDoc.id] = userDoc.data().company || "";
          });
        }

        const data = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            company: usersMap[docSnap.data().userId] || "Unknown",
          }))
          .sort((a, b) => {
            const dateA = a.requestDate?.seconds ? a.requestDate.seconds * 1000 : new Date(a.requestDate).getTime();
            const dateB = b.requestDate?.seconds ? b.requestDate.seconds * 1000 : new Date(b.requestDate).getTime();
            return dateB - dateA; // más nuevo a más viejo
          });

        if (!hasLogged.current) {
          console.log(`Fetched ${data.length} request(s) for ${role} with UID: ${currentUserId}`);
          hasLogged.current = true;
        }
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
      }
    };

    const fetchProviders = async () => {
      if (role !== "admin") return;
      try {
        const q = query(collection(db, "users"), where("role", "==", "provider"));
        const snap = await getDocs(q);
        const provs = snap.docs.map((d) => ({
          uid: d.data().uid,
          name: d.data().name || d.data().email,
        }));
        setProviders(provs);
      } catch (err) {
        console.error("Error fetching providers:", err);
      }
    };

    fetchRequests();
    fetchProviders();
  }, [role, currentUserId]);

  const handleFilterChange = (e, field) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleEdit = async (id, field, value) => {
    const requestRef = doc(db, "serviceRequests", id);
    await updateDoc(requestRef, { [field]: value });
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, [field]: value } : req)));
  };

  const handleAssignProvider = async (id, providerId) => {
    const provider = providers.find((p) => p.uid === providerId);
    const requestRef = doc(db, "serviceRequests", id);
    await updateDoc(requestRef, {
      assignedProviderId: providerId || null,
      assignedProviderName: provider?.name || null,
    });
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              assignedProviderId: providerId || null,
              assignedProviderName: provider?.name || null,
            }
          : req
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    await deleteDoc(doc(db, "serviceRequests", id));
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleUploadAttachment2 = async (id, file) => {
    if (!file) return;
    const fileRef = ref(storage, `serviceRequests/${id}/attachment2_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, "serviceRequests", id), { attachment2: url });
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, attachment2: url } : req)));
  };

  const handleDownloadPDF = () => window.print();

  const filteredRequests = requests.filter((req) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(req[key] || "").toLowerCase().includes(value.toLowerCase());
    })
  );

  const isProviderAssignedToRow = (req) =>
    role === "provider" && req.assignedProviderId === currentUserId;

  const getStatusClass = (status) => {
    if (!status) return "";
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-800 font-bold";
      case "approved":
        return "text-blue-800 font-bold";
      case "completed":
        return "text-green-800 font-bold";
      default:
        return "";
    }
  };

  return (
    <div className="p-5 min-h-screen">
      {/* Filtros */}
      <div className="bg-white fixed top-0 left-0 w-full z-50 p-2 no-print" style={{ top: "60px" }}>
        <div className="flex flex-wrap gap-2 my-2">
          {["requestId", "company", "userName", "status"].map((field) => (
            <input
              key={field}
              placeholder={`Filter by ${field}`}
              value={filters[field] || ""}
              onChange={(e) => handleFilterChange(e, field)}
              className="border rounded px-3 py-2 text-sm border-gray-300"
            />
          ))}
          <button
            onClick={handleDownloadPDF}
            className="border rounded px-4 py-2 text-sm font-medium text-black hover:bg-blue-100"
          >
            Download
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-42 overflow-x-auto border rounded-lg">
        <table className="min-w-[1200px] w-full border-collapse table-auto">
          <thead className="bg-gray-100 sticky top-0 z-40">
            <tr>
              <th className="border px-4 py-2 text-left">ID Request</th>
              <th className="border px-4 py-2 text-left">Company</th>
              <th className="border px-4 py-2 text-left">Client</th>
              <th className="border px-4 py-2 text-left">Request Date</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Payment Instructions</th>
              <th className="border px-4 py-2 text-left">Assigned Provider</th>
              <th className="border px-4 py-2 text-left">Attachment 1</th>
              <th className="border px-4 py-2 text-left">Attachment 2</th>
              {canDelete && <th className="border px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 10 : 9} className="border px-4 py-2 text-center">
                  No hay solicitudes disponibles
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isCompleted = req.status?.toLowerCase() === "completed";
                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{req.requestId}</td>
                    <td className="border px-4 py-2">{req.company}</td>
                    <td className="border px-4 py-2">{req.userName}</td>
                    <td className="border px-4 py-2">{formatDate(req.requestDate)}</td>
                    <td className="border px-4 py-2">
                      {canEditStatus ? (
                        <select
                          value={req.status || ""}
                          onChange={(e) => handleEdit(req.id, "status", e.target.value)}
                          className={`border rounded px-2 py-1 ${getStatusClass(req.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span className={getStatusClass(req.status)}>{req.status}</span>
                      )}
                    </td>

                    <td className="border px-4 py-2">
                      {formatPaymentInstructions(req.paymentInstructions)}
                    </td>
                    <td className="border px-4 py-2">
                      {canEditStatus ? (
                        <select
                          value={req.assignedProviderId || ""}
                          onChange={(e) => handleAssignProvider(req.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">-- Select Provider --</option>
                          {providers.map((p) => (
                            <option key={p.uid} value={p.uid}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        req.assignedProviderName || "Unassigned"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {req.attachment1 && (
                        <a
                          href={req.attachment1}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {req.attachment2 && (
                        <a
                          href={req.attachment2}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      )}
                      {role === "provider" && isProviderAssignedToRow(req) && !isCompleted && (
                        <input
                          type="file"
                          onChange={(e) => handleUploadAttachment2(req.id, e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                      {role === "admin" && (
                        <input
                          type="file"
                          onChange={(e) => handleUploadAttachment2(req.id, e.target.files[0])}
                          className="mt-2"
                        />
                      )}
                    </td>
                    {canDelete && (
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
