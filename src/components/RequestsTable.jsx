import { useEffect, useState } from "react";
import { db, storage } from "../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext"; // Aquí debe venir el role y userId

export const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({});
  const { profile } = useAuth();

  const role = profile?.role || "user";
  const currentUserId = profile?.uid;

  const canEditStatus = role === "admin";
  const canDelete = role === "admin";
  const canUploadAttachment2 = role === "provider";

  // Cargar solicitudes
  useEffect(() => {
    const fetchRequests = async () => {
      const snapshot = await getDocs(collection(db, "serviceRequests"));
      let data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Filtrar para usuarios normales
      if (role === "user") {
        data = data.filter((req) => req.userId === currentUserId);
      }

      setRequests(data);
    };

    fetchRequests();
  }, [role, currentUserId]);

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

  const handleUploadAttachment2 = async (id, file) => {
    if (!file) return;
    const fileRef = ref(storage, `serviceRequests/${id}/attachment2_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, "serviceRequests", id), { attachment2: url });
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, attachment2: url } : req
      )
    );
  };

  // Filtrar resultados con los inputs de búsqueda
  const filteredRequests = requests.filter((req) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(req[key] || "")
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  });

  return (
    <div className="p-5">
      <h2 className="text-lg font-semibold mb-4">Service Requests</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["requestId", "userName", "status"].map((field) => (
          <input
            key={field}
            placeholder={`Filter by ${field}`}
            value={filters[field] || ""}
            onChange={(e) => handleFilterChange(e, field)}
            className="border rounded px-3 py-2 text-sm"
          />
        ))}
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-[800px] w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID Request</th>
              <th className="border px-4 py-2 text-left">User</th>
              <th className="border px-4 py-2 text-left">Request Date</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Payment Instructions</th>
              <th className="border px-4 py-2 text-left">Attachment 1</th>
              <th className="border px-4 py-2 text-left">Attachment 2</th>
              {canDelete && <th className="border px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{req.requestId}</td>
                <td className="border px-4 py-2">{req.userName}</td>
                <td className="border px-4 py-2">
                  {req.requestDate?.seconds
                    ? new Date(req.requestDate.seconds * 1000).toLocaleDateString()
                    : ""}
                </td>
                <td className="border px-4 py-2">
                  {canEditStatus ? (
                    <select
                      value={req.status || ""}
                      onChange={(e) =>
                        handleEdit(req.id, "status", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    req.status
                  )}
                </td>
                <td className="border px-4 py-2">
                  {req.paymentInstructions
                    ? JSON.stringify(req.paymentInstructions)
                    : ""}
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
                  {canUploadAttachment2 && (
                    <input
                      type="file"
                      onChange={(e) =>
                        handleUploadAttachment2(req.id, e.target.files[0])
                      }
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
