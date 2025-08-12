// src/components/RequestsTable.jsx
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({});

  // Cargar solicitudes al montar
  useEffect(() => {
    const fetchRequests = async () => {
      const snapshot = await getDocs(collection(db, "serviceRequests"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    };

    fetchRequests();
  }, []);

  const handleFilterChange = (e, field) => {
    setFilters({
      ...filters,
      [field]: e.target.value,
    });
  };

  const handleEdit = async (id, field, value) => {
    const requestRef = doc(db, "serviceRequests", id);
    await updateDoc(requestRef, { [field]: value });
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    await deleteDoc(doc(db, "serviceRequests", id));
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  // Filtrar resultados
  const filteredRequests = requests.filter((req) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(req[key] || "")
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Service Requests</h2>

      {/* Filtros */}
      <div style={{ marginBottom: 10 }}>
        {["requestId", "userName", "status"].map((field) => (
          <input
            key={field}
            placeholder={`Filter by ${field}`}
            value={filters[field] || ""}
            onChange={(e) => handleFilterChange(e, field)}
            style={{ marginRight: 10 }}
          />
        ))}
      </div>

      {/* Tabla */}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID Request</th>
            <th>User</th>
            <th>Request Date</th>
            <th>Status</th>
            <th>Payment Instructions</th>
            <th>Attachment 1</th>
            <th>Attachment 2</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.requestId}</td>
              <td>{req.userName}</td>
              <td>
                {req.requestDate?.seconds
                  ? new Date(req.requestDate.seconds * 1000).toLocaleDateString()
                  : ""}
              </td>
              <td>
                <select
                  value={req.status || ""}
                  onChange={(e) =>
                    handleEdit(req.id, "status", e.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td>
                {req.paymentInstructions
                  ? JSON.stringify(req.paymentInstructions)
                  : ""}
              </td>
              <td>
                {req.attachment1 && (
                  <a href={req.attachment1} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
              </td>
              <td>
                {req.attachment2 && (
                  <a href={req.attachment2} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
              </td>
              <td>
                <button onClick={() => handleDelete(req.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
