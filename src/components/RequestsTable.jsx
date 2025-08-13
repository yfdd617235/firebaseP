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


// // Load jsPDF and html2canvas from CDN
// const loadScripts = () => {
//   return Promise.all([
//     new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
//       script.async = true;
//       script.onload = () => resolve(window.jspdf);
//       document.body.appendChild(script);
//     }),
//     new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
//       script.async = true;
//       script.onload = () => resolve(window.html2canvas);
//       document.body.appendChild(script);
//     }),
//   ]);
// };

// // Function to format dates as dd-MMM-AAAA
// const formatDate = (dateInput) => {
//   let date;
//   if (dateInput?.seconds) {
//     // Handle Firestore Timestamp
//     date = new Date(dateInput.seconds * 1000);
//   } else if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
//     // Handle ISO string yyyy-mm-dd
//     date = new Date(dateInput);
//   } else {
//     return "";
//   }
//   if (isNaN(date.getTime())) return "";
//   const day = String(date.getDate()).padStart(2, "0");
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//   ];
//   const month = months[date.getMonth()];
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// // Function to format paymentInstructions
// const formatPaymentInstructions = (paymentInstructions) => {
//   if (!paymentInstructions) return "";
//   const {
//     account = "",
//     amount = 0,
//     requiredDate,
//     pickupAddress = "",
//     deliveryAddress = "",
//     bankEntity = "",
//     beneficiaryId = ""
//   } = paymentInstructions;
//   const formattedDate = formatDate(requiredDate);
//   return `Account: ${account}, Amount: ${amount}, Required Date: ${formattedDate}, Pickup Address: ${pickupAddress}, Delivery Address: ${deliveryAddress}, Bank Entity: ${bankEntity}, Beneficiary ID: ${beneficiaryId}`;
// };

// export const RequestsTable = () => {
//   const [requests, setRequests] = useState([]);
//   const [filters, setFilters] = useState({});
//   const { profile, loading } = useAuth();
//   const hasLogged = useRef(false); // Prevent duplicate logs in StrictMode
//   const tableRef = useRef(null); // Reference to the table element
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   if (loading) {
//     return <div>Loading profile...</div>;
//   }

//   if (!profile) {
//     return <div>No user profile available</div>;
//   }

//   const role = profile?.role || "client";
//   const currentUserId = profile?.uid;

//   const canEditStatus = role === "admin";
//   const canDelete = role === "admin";
//   const canUploadAttachment2 = role === "provider";

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         let snapshot;
//         if (role === "client") {
//           // Filter requests for the current client
//           const q = query(
//             collection(db, "serviceRequests"),
//             where("userId", "==", currentUserId)
//           );
//           snapshot = await getDocs(q);
//         } else {
//           // Admins and providers see all requests
//           snapshot = await getDocs(collection(db, "serviceRequests"));
//         }

//         const data = snapshot.docs.map((docSnap) => ({
//           id: docSnap.id,
//           ...docSnap.data(),
//         }));

//         // Log only on first execution with limited info
//         if (!hasLogged.current) {
//           console.log(
//             `Fetched ${data.length} request(s) for ${role} with UID: ${currentUserId}`
//           );
//           hasLogged.current = true;
//         }

//         setRequests(data);
//       } catch (error) {
//         console.error("Error fetching requests:", error);
//         setRequests([]);
//       }
//     };

//     fetchRequests();
//   }, [role, currentUserId]);

//   const handleFilterChange = (e, field) => {
//     setFilters({
//       ...filters,
//       [field]: e.target.value,
//     });
//   };

//   const handleEdit = async (id, field, value) => {
//     const requestRef = doc(db, "serviceRequests", id);
//     await updateDoc(requestRef, { [field]: value });
//     setRequests((prev) =>
//       prev.map((req) => (req.id === id ? { ...req, [field]: value } : req))
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
//     setRequests((prev) =>
//       prev.map((req) => (req.id === id ? { ...req, attachment2: url } : req))
//     );
//   };

//   const handleDownloadPDF = async () => {
//     if (isGeneratingPDF) return;
//     setIsGeneratingPDF(true);

//     try {
//       const [jspdf, html2canvas] = await loadScripts();
//       const { jsPDF } = jspdf;

//       const table = tableRef.current;
//       if (!table) {
//         console.error("Table element not found");
//         return;
//       }

//       // Capture the table as a canvas
//       const canvas = await html2canvas(table, {
//         scale: 2, // Increase resolution
//         useCORS: true,
//         logging: false,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF({
//         orientation: "landscape", // Use landscape to fit wide table
//         unit: "mm",
//         format: "a4",
//       });

//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pageWidth - 20; // 10mm margin on each side
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       // Add first page
//       pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
//       heightLeft -= pageHeight - 20;

//       // Add additional pages if the table is too tall
//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
//         heightLeft -= pageHeight - 20;
//       }

//       pdf.save("service_requests.pdf");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

//   const filteredRequests = requests.filter((req) => {
//     return Object.entries(filters).every(([key, value]) => {
//       if (!value) return true;
//       return String(req[key] || "")
//         .toLowerCase()
//         .includes(value.toLowerCase());
//     });
//   });

//   return (
//     <div className="p-5">
//       <h2 className="text-lg font-semibold mb-4">Service Requests</h2>
//       <div className="flex flex-wrap gap-2 mb-4">
//         {["requestId", "userName", "status"].map((field) => (
//           <input
//             key={field}
//             placeholder={`Filter by ${field}`}
//             value={filters[field] || ""}
//             onChange={(e) => handleFilterChange(e, field)}
//             className="border rounded px-3 py-2 text-sm"
//           />
//         ))}
//         <button
//           onClick={handleDownloadPDF}
//           disabled={isGeneratingPDF}
//           className="border rounded px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
//         </button>
//       </div>
//       <div className="overflow-x-auto border rounded-lg">
//         <table ref={tableRef} className="min-w-[800px] w-full border-collapse">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-4 py-2 text-left">ID Request</th>
//               <th className="border px-4 py-2 text-left">Client</th>
//               <th className="border px-4 py-2 text-left">Request Date</th>
//               <th className="border px-4 py-2 text-left">Status</th>
//               <th className="border px-4 py-2 text-left">Payment Instructions</th>
//               <th className="border px-4 py-2 text-left">Attachment 1</th>
//               <th className="border px-4 py-2 text-left">Attachment 2</th>
//               {canDelete && <th className="border px-4 py-2 text-left">Actions</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRequests.length === 0 ? (
//               <tr>
//                 <td colSpan={canDelete ? 8 : 7} className="border px-4 py-2 text-center">
//                   No requests available
//                 </td>
//               </tr>
//             ) : (
//               filteredRequests.map((req) => (
//                 <tr key={req.id} className="hover:bg-gray-50">
//                   <td className="border px-4 py-2">{req.requestId}</td>
//                   <td className="border px-4 py-2">{req.userName}</td>
//                   <td className="border px-4 py-2">
//                     {formatDate(req.requestDate)}
//                   </td>
//                   <td className="border px-4 py-2">
//                     {canEditStatus ? (
//                       <select
//                         value={req.status || ""}
//                         onChange={(e) => handleEdit(req.id, "status", e.target.value)}
//                         className="border rounded px-2 py-1"
//                       >
//                         <option value="Pending">Pending</option>
//                         <option value="Approved">Approved</option>
//                         <option value="Completed">Completed</option>
//                       </select>
//                     ) : (
//                       req.status
//                     )}
//                   </td>
//                   <td className="border px-4 py-2">
//                     {formatPaymentInstructions(req.paymentInstructions)}
//                   </td>
//                   <td className="border px-4 py-2">
//                     {req.attachment1 && (
//                       <a
//                         href={req.attachment1}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-600 hover:underline"
//                       >
//                         View
//                       </a>
//                     )}
//                   </td>
//                   <td className="border px-4 py-2">
//                     {req.attachment2 && (
//                       <a
//                         href={req.attachment2}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-600 hover:underline"
//                       >
//                         View
//                       </a>
//                     )}
//                     {canUploadAttachment2 && (
//                       <input
//                         type="file"
//                         onChange={(e) => handleUploadAttachment2(req.id, e.target.files[0])}
//                         className="mt-2"
//                       />
//                     )}
//                   </td>
//                   {canDelete && (
//                     <td className="border px-4 py-2">
//                       <button
//                         onClick={() => handleDelete(req.id)}
//                         className="text-red-600 hover:underline"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   )}
//                 </tr>
//               ))
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

// Load jsPDF from CDN
const loadScripts = () => {
  return Promise.all([
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.onload = () => resolve(window.jspdf);
      document.body.appendChild(script);
    }),
  ]);
};

// Function to format dates as dd-MMM-AAAA
const formatDate = (dateInput) => {
  let date;
  if (dateInput?.seconds) {
    // Handle Firestore Timestamp
    date = new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Handle ISO string yyyy-mm-dd
    date = new Date(dateInput);
  } else {
    return "";
  }
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Function to format paymentInstructions
const formatPaymentInstructions = (paymentInstructions) => {
  if (!paymentInstructions) return "";
  const {
    account = "",
    amount = 0,
    requiredDate,
    pickupAddress = "",
    deliveryAddress = "",
    bankEntity = "",
    beneficiaryId = ""
  } = paymentInstructions;
  const formattedDate = formatDate(requiredDate);
  return `Account: ${account}, Amount: ${amount}, Required Date: ${formattedDate}, Pickup Address: ${pickupAddress}, Delivery Address: ${deliveryAddress}, Bank Entity: ${bankEntity}, Beneficiary ID: ${beneficiaryId}`;
};

export const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const { profile, loading } = useAuth();
  const hasLogged = useRef(false); // Prevent duplicate logs in StrictMode
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>No user profile available</div>;
  }

  const role = profile?.role || "client";
  const currentUserId = profile?.uid;

  const canEditStatus = role === "admin";
  const canDelete = role === "admin";
  const canUploadAttachment2 = role === "provider";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let snapshot;
        if (role === "client") {
          // Filter requests for the current client
          const q = query(
            collection(db, "serviceRequests"),
            where("userId", "==", currentUserId)
          );
          snapshot = await getDocs(q);
        } else {
          // Admins and providers see all requests
          snapshot = await getDocs(collection(db, "serviceRequests"));
        }

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Log only on first execution with limited info
        if (!hasLogged.current) {
          console.log(
            `Fetched ${data.length} request(s) for ${role} with UID: ${currentUserId}`
          );
          hasLogged.current = true;
        }

        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
      }
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
      prev.map((req) => (req.id === id ? { ...req, [field]: value } : req))
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
      prev.map((req) => (req.id === id ? { ...req, attachment2: url } : req))
    );
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setError(null);

    try {
      const [jspdf] = await loadScripts();
      const { jsPDF } = jspdf;

      const pdf = new jsPDF({
        orientation: "landscape", // Use landscape to fit wide table
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const rowHeight = 10;
      const colWidths = [30, 30, 30, 20, 80, 30, 30, canDelete ? 20 : 0]; // Widths for each column
      const headers = [
        "ID Request",
        "Client",
        "Request Date",
        "Status",
        "Payment Instructions",
        "Attachment 1",
        "Attachment 2",
        ...(canDelete ? ["Actions"] : []),
      ];

      let y = margin + 10; // Start below title
      pdf.setFontSize(12);
      pdf.text("Service Requests", margin, margin); // Title

      // Draw headers
      let x = margin;
      pdf.setFontSize(10);
      headers.forEach((header, index) => {
        pdf.text(header, x, y, { maxWidth: colWidths[index] });
        x += colWidths[index];
      });
      y += rowHeight;

      // Draw rows
      filteredRequests.forEach((req) => {
        if (y + rowHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        x = margin;
        pdf.text(req.requestId || "", x, y, { maxWidth: colWidths[0] });
        x += colWidths[0];
        pdf.text(req.userName || "", x, y, { maxWidth: colWidths[1] });
        x += colWidths[1];
        pdf.text(formatDate(req.requestDate) || "", x, y, { maxWidth: colWidths[2] });
        x += colWidths[2];
        pdf.text(req.status || "", x, y, { maxWidth: colWidths[3] });
        x += colWidths[3];
        pdf.text(formatPaymentInstructions(req.paymentInstructions) || "", x, y, { maxWidth: colWidths[4] });
        x += colWidths[4];
        pdf.text(req.attachment1 ? "View" : "", x, y, { maxWidth: colWidths[5] });
        x += colWidths[5];
        pdf.text(req.attachment2 ? "View" : "", x, y, { maxWidth: colWidths[6] });
        x += colWidths[6];
        if (canDelete) {
          pdf.text("Delete", x, y, { maxWidth: colWidths[7] });
        }
        y += rowHeight;
      });

      pdf.save("service_requests.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("No se pudo generar el PDF. Por favor, intenta de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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
      <div className="flex flex-wrap gap-2 mb-4">
        {["requestId", "userName", "status"].map((field) => (
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
          disabled={isGeneratingPDF}
          className="border rounded px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-[800px] w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID Request</th>
              <th className="border px-4 py-2 text-left">Client</th>
              <th className="border px-4 py-2 text-left">Request Date</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Payment Instructions</th>
              <th className="border px-4 py-2 text-left">Attachment 1</th>
              <th className="border px-4 py-2 text-left">Attachment 2</th>
              {canDelete && <th className="border px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 8 : 7} className="border px-4 py-2 text-center">
                  No hay solicitudes disponibles
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{req.requestId}</td>
                  <td className="border px-4 py-2">{req.userName}</td>
                  <td className="border px-4 py-2">
                    {formatDate(req.requestDate)}
                  </td>
                  <td className="border px-4 py-2">
                    {canEditStatus ? (
                      <select
                        value={req.status || ""}
                        onChange={(e) => handleEdit(req.id, "status", e.target.value)}
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
                    {formatPaymentInstructions(req.paymentInstructions)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};