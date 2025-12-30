// // src/pages/BillsList.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiFetch, API_BASE } from "../lib/api";

// export default function BillsList() {
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [deletingId, setDeletingId] = useState(null); // track which bill is being deleted
//   const navigate = useNavigate();

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await apiFetch("/api/bills");
//         setBills(data);
//       } catch (e) {
//         setError(e.message || "Failed to load bills");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   async function handleDelete(bill) {
//     // bill: { id, invoiceNo, ... }
//     if (!bill || !bill.id) return;
//     const confirmText = `Delete invoice ${bill.invoiceNo} and all its payments/refunds? This is permanent.`;
//     if (!window.confirm(confirmText)) return;

//     setDeletingId(bill.id);
//     setError("");

//     try {
//       // call delete endpoint
//       const resp = await apiFetch(`/api/bills/${bill.id}`, {
//         method: "DELETE",
//       });

//       // if your apiFetch throws on non-2xx, the catch below will handle it
//       // optimistic UI remove
//       setBills((prev) => prev.filter((b) => b.id !== bill.id));
//     } catch (e) {
//       console.error("Delete failed:", e);
//       setError(e.message || "Failed to delete invoice");
//       // do not remove from UI
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   if (loading) return <div className="text-sm">Loading bills...</div>;
//   if (error) return <div className="text-sm text-red-600">{error}</div>;

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-semibold">Bills</h3>
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-50 border-b border-slate-200">
//             <tr>
//               <th className="px-3 py-2 text-left">Bill #</th>
//               <th className="px-3 py-2 text-left">Patient</th>
//               <th className="px-3 py-2 text-left">Date</th>
//               <th className="px-3 py-2 text-right">Total</th>
//               <th className="px-3 py-2 text-right">Paid (net)</th>
//               <th className="px-3 py-2 text-right">Refunded</th>
//               <th className="px-3 py-2 text-right">Balance</th>
//               <th className="px-3 py-2 text-center">Status / Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {bills.map((bill) => {
//               const isPaid = bill.balance <= 0;
//               const isDeleting = deletingId === bill.id;
//               return (
//                 <tr
//                   key={bill.id}
//                   className="border-b border-slate-100 last:border-0"
//                 >
//                   <td className="px-3 py-2">#{bill.invoiceNo}</td>
//                   <td className="px-3 py-2">{bill.patientName}</td>
//                   <td className="px-3 py-2">{bill.date}</td>
//                   <td className="px-3 py-2 text-right">
//                     ₹ {Number(bill.total).toFixed(2)}
//                   </td>
//                   <td className="px-3 py-2 text-right">
//                     ₹ {Number(bill.paid).toFixed(2)}
//                   </td>
//                   <td className="px-3 py-2 text-right">
//                     ₹ {Number(bill.refunded || 0).toFixed(2)}
//                   </td>
//                   <td className="px-3 py-2 text-right">
//                     ₹ {Number(bill.balance).toFixed(2)}
//                   </td>
//                   <td className="px-3 py-2">
//                     <div className="flex flex-col gap-1 items-center">
//                       <span
//                         className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
//                           isPaid
//                             ? "bg-emerald-50 text-emerald-700"
//                             : "bg-amber-50 text-amber-700"
//                         }`}
//                       >
//                         {isPaid ? "Paid" : "Pending"}
//                       </span>

//                       <div className="flex flex-wrap gap-1 justify-center mt-1">
//                         <button
//                           type="button"
//                           onClick={() => navigate(`/bills/${bill.id}/edit`)}
//                           className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
//                         >
//                           Edit Bill
//                         </button>

//                         {/* {!isPaid && (
//                           <button
//                             type="button"
//                             onClick={() => navigate(`/bills/${bill.id}`)}
//                             className="px-2 py-0.5 text-[11px] rounded border border-amber-400 text-amber-700 hover:bg-amber-50"
//                           >
//                             Pay / Refund
//                           </button>
//                         )} */}

//                         <button
//                           type="button"
//                           onClick={() => navigate(`/bills/${bill.id}`)}
//                           className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
//                         >
//                           View Bills
//                         </button>

//                         {/* <button
//                           type="button"
//                           onClick={() =>
//                             window.open(
//                               `${API_BASE}/api/bills/${bill.id}/invoice-html-pdf`,
//                               "_blank"
//                             )
//                           }
//                           className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
//                         >
//                           Download Invoice
//                         </button> */}

//                         {isPaid && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               window.open(
//                                 `${API_BASE}/api/bills/${bill.id}/full-payment-pdf`,
//                                 "_blank"
//                               )
//                             }
//                             className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
//                           >
//                             Download Invoice
//                           </button>
//                         )}

//                         {/* DELETE BUTTON */}
//                         <button
//                           type="button"
//                           onClick={() => handleDelete(bill)}
//                           className={`px-2 py-0.5 text-[11px] rounded border border-red-400 text-red-700 hover:bg-red-50`}
//                           disabled={isDeleting}
//                           aria-disabled={isDeleting}
//                         >
//                           {isDeleting ? "Deleting..." : "Delete"}
//                         </button>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}

//             {bills.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={8}
//                   className="px-3 py-6 text-center text-xs text-slate-500"
//                 >
//                   No bills yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




// src/pages/BillsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../lib/api";

export default function BillsList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/bills");
        setBills(data);
      } catch (e) {
        setError(e.message || "Failed to load bills");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  async function handleDelete(bill) {
    if (!bill || !bill.id) return;
    const confirmText = `Delete invoice ${bill.invoiceNo} and all its payments/refunds? This is permanent.`;
    if (!window.confirm(confirmText)) return;

    setDeletingId(bill.id);
    setError("");

    try {
      await apiFetch(`/api/bills/${bill.id}`, {
        method: "DELETE",
      });

      setBills((prev) => prev.filter((b) => b.id !== bill.id));
    } catch (e) {
      console.error("Delete failed:", e);
      setError(e.message || "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div className="text-sm">Loading bills...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bills</h3>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Bill #</th>
              <th className="px-3 py-2 text-left">Patient</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Paid (net)</th>
              <th className="px-3 py-2 text-right">Refunded</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-center">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const isPaid = bill.balance <= 0;
              const isProcedureCompleted = bill.procedureConfirmed === true;
              const isDeleting = deletingId === bill.id;
              
              // Show "Paid" status if procedure is completed OR balance is 0
              const showPaidStatus = isProcedureCompleted || isPaid;
              
              return (
                <tr
                  key={bill.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-3 py-2">#{bill.invoiceNo}</td>
                  <td className="px-3 py-2">{bill.patientName}</td>
                  <td className="px-3 py-2">{bill.date}</td>
                  <td className="px-3 py-2 text-right">
                    ₹ {Number(bill.total).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₹ {Number(bill.paid).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₹ {Number(bill.refunded || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isProcedureCompleted ? (
                      <span className="text-emerald-600 font-semibold text-xs">
                        Treatment Completed
                      </span>
                    ) : (
                      `₹ ${Number(bill.balance).toFixed(2)}`
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1 items-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          showPaidStatus
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {showPaidStatus ? "Paid" : "Pending"}
                      </span>

                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/bills/${bill.id}/edit`)}
                          className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
                        >
                          Edit Bill
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/bills/${bill.id}`)}
                          className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
                        >
                          View Bill
                        </button>

                        {isProcedureCompleted && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `${API_BASE}/api/bills/${bill.id}/full-payment-pdf`,
                                "_blank"
                              )
                            }
                            className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
                          >
                            Download Invoice
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(bill)}
                          className={`px-2 py-0.5 text-[11px] rounded border border-red-400 text-red-700 hover:bg-red-50`}
                          disabled={isDeleting}
                          aria-disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {bills.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-xs text-slate-500"
                >
                  No bills yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}