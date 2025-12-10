// src/pages/EditBill.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

let rowId = 1;

export default function EditBill() {
  const { id } = useParams(); // billId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    sex: "",
    address: "",
    age: "",
    date: "",
    remarks: "",
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/bills/${id}`);
        setForm({
          patientName: data.patientName || "",
          sex: data.sex || "",
          address: data.address || "",
          age: data.age != null ? String(data.age) : "",
          date: data.date || new Date().toISOString().slice(0, 10),
          remarks: data.remarks || "",
        });

        const src =
          Array.isArray(data.services) && data.services.length > 0
            ? data.services
            : data.items || [];

        setServices(
          src.map((s) => ({
            id: rowId++,
            item: s.item || s.description || "",
            details: s.details || "",
            qty: String(s.qty ?? s.quantity ?? 1),
            rate: String(s.rate ?? s.price ?? 0),
          }))
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (rowIdLocal, field, value) => {
    setServices((prev) =>
      prev.map((row) =>
        row.id === rowIdLocal ? { ...row, [field]: value } : row
      )
    );
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { id: rowId++, item: "", details: "", qty: "1", rate: "0" },
    ]);
  };

  const removeServiceRow = (rowIdLocal) => {
    setServices((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== rowIdLocal)
    );
  };

  const servicesWithAmount = services.map((s) => {
    const qty = Number(s.qty) || 0;
    const rate = Number(s.rate) || 0;
    const lineAmount = qty * rate;
    return { ...s, qty, rate, lineAmount };
  });

  const subtotal = servicesWithAmount.reduce(
    (sum, s) => sum + s.lineAmount,
    0
  );
  const total = subtotal;
  const formattedTotal = total.toFixed(2);

  const handleSave = async () => {
    const cleanedServices = servicesWithAmount.map(
      ({ id, lineAmount, ...rest }) => rest
    );

    const payload = {
      patientName: form.patientName,
      sex: form.sex,
      address: form.address,
      age: form.age,
      date: form.date,
      remarks: form.remarks,
      services: cleanedServices,
      // adjust optional; if you want to support, add here
    };

    try {
      await apiFetch(`/api/bills/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      alert("Bill updated successfully");
      navigate(`/bills/${id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-sm">Loading bill...</div>;
  if (error)
    return <div className="text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Edit Bill (No Payment Change)</h3>

      {/* Patient details same as CreateBill */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h4 className="text-sm font-semibold mb-2">Patient Details</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={form.patientName}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows={2}
              value={form.address}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Sex
            </label>
            <div className="flex items-center gap-4 mt-1 text-sm">
              {["Male", "Female", "Other"].map((opt) => (
                <label key={opt} className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="sex"
                    value={opt}
                    checked={form.sex === opt}
                    onChange={handleFormChange}
                    className="h-3 w-3"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services section (same as CreateBill) */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Service Details</h4>
          <button
            type="button"
            onClick={addServiceRow}
            className="text-xs px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            + Add Service
          </button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-500 border-b border-slate-200 pb-1">
          <div className="col-span-4">Service / Item</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-1 text-right">Amount</div>
        </div>

        <div className="space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div
              key={row.id}
              className="relative grid grid-cols-12 gap-3 items-center pr-6"
            >
              <div className="col-span-12 md:col-span-4">
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) =>
                    handleServiceChange(row.id, "item", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder={`Service ${idx + 1}`}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <input
                  type="text"
                  value={row.details}
                  onChange={(e) =>
                    handleServiceChange(row.id, "details", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Description / notes (optional)"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleServiceChange(row.id, "qty", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  min="0"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleServiceChange(row.id, "rate", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-4 md:col-span-1">
                <div className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right bg-slate-50">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeServiceRow(row.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-red-600 disabled:text-slate-300"
                disabled={services.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: remarks + total + save */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Remarks (optional)
            </label>
            <input
              type="text"
              name="remarks"
              value={form.remarks}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="flex flex-col items-end justify-center">
            <span className="text-xs text-slate-500">Bill Total</span>
            <span className="text-base font-semibold">
              ₹ {formattedTotal}
            </span>
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
