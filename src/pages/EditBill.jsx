// src/pages/EditBill.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

let rowId = 1;
function normalizeDateForInput(d) {
  if (!d) return "";
  // already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

  // convert dd.mm.yyyy → yyyy-mm-dd (safety)
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  return "";
}

export default function EditBill() {
  const { id } = useParams(); // billId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    procedureDone: "",
    patientName: "",
    sex: "",
    address: "",
    age: "",
    date: "",
    remarks: "",
    // keep payment fields out — EditBill is "No Payment Change"
  });

  // services use same shape as CreateBill: { id, description, qty, rate }
  const [services, setServices] = useState([
    { id: rowId++, description: "", qty: "1", rate: "0" },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/bills/${id}`);
        setForm({
          procedureDone: data.procedureDone || "",
          patientName: data.patientName || "",
          sex: data.sex || "",
          address: data.address || "",
          age: data.age != null ? String(data.age) : "",
          date: data.date || "",
          remarks: data.remarks || "",
        });

        const src =
          Array.isArray(data.services) && data.services.length > 0
            ? data.services
            : data.items || [];

        // normalize incoming items to { description, qty, rate }
        const normalized =
          src.length > 0
            ? src.map((s) => ({
                id: rowId++,
                description: s.description ?? s.item ?? s.description ?? "",
                // support several possible field names, fallbacks to sensible defaults
                qty: String(s.qty ?? s.quantity ?? 1),
                rate: String(s.rate ?? s.price ?? 0),
              }))
            : [{ id: rowId++, description: "", qty: "1", rate: "0" }];

        setServices(normalized);
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
      { id: rowId++, description: "", qty: "1", rate: "0" },
    ]);
  };

  const removeServiceRow = (rowIdLocal) => {
    setServices((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.id !== rowIdLocal)
    );
  };

  // ---------- NUMERIC DERIVED VALUES ----------
  const servicesWithAmount = services.map((s) => {
    const qty = Number(s.qty) || 0;
    const rate = Number(s.rate) || 0;
    const lineAmount = qty * rate;
    return { ...s, qty, rate, lineAmount };
  });

  const subtotal = servicesWithAmount.reduce((sum, s) => sum + s.lineAmount, 0);
  const total = subtotal;
  const formattedTotal = total.toFixed(2);

  const handleSave = async () => {
    // clean internal-only fields before sending
    const cleanedServices = servicesWithAmount.map(
      ({ id, lineAmount, ...rest }) => rest
    );

    const payload = {
      patientName: form.patientName,
      sex: form.sex,
      procedureDone: form.procedureDone,
      address: form.address,
      age: form.age,
      date: form.date,
      remarks: form.remarks,
      services: cleanedServices,
      total: formattedTotal,
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
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;

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
          {/* <div>
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
          </div> */}
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
          {/* <div>
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
          </div> */}
        </div>
      </div>

      {/* Services section now matches CreateBill's "Treatment Breakup Details" */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex gap-4">
          <h3 className="text-lg font-semibold">Procedure Done :-</h3>

          <input
            type="text"
            name="procedureDone"
            value={form.procedureDone}
            onChange={handleFormChange}
            className="w-84 border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="e.g. Cataract Surgery / Retina Check-up / Glaucoma Evaluation"
          />
        </div>

        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Treatment Breakup Details</h4>
          <button
            type="button"
            onClick={addServiceRow}
            className="text-xs px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            + Add Item
          </button>
        </div>

        {/* Header (desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-500 border-b border-slate-200 pb-1">
          <div className="col-span-1">Sr.</div>
          <div className="col-span-6">Description of Items/Service</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-2">Amount</div>
        </div>

        {/* Rows (desktop) */}
        <div className="space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div
              key={row.id}
              className="relative grid grid-cols-12 gap-3 items-center pr-6"
            >
              <div className="col-span-12 md:col-span-1 text-sm md:text-[13px] flex items-center">
                {idx + 1}
              </div>

              <div className="col-span-12 md:col-span-6">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleServiceChange(row.id, "description", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder={`Description ${idx + 1}`}
                />
              </div>

              <div className="col-span-4 md:col-span-1">
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

              <div className="col-span-4 md:col-span-2">
                <div className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right bg-slate-50">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>

              {/* Delete button - absolute right */}
              <button
                type="button"
                onClick={() => removeServiceRow(row.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-red-600 disabled:text-slate-300"
                disabled={services.length === 1}
                title={
                  services.length === 1
                    ? "At least one row required"
                    : "Remove item"
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Mobile-friendly rows */}
        <div className="md:hidden space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div
              key={`m-${row.id}`}
              className="border border-slate-100 rounded-md p-2"
            >
              <div className="flex justify-between items-center text-sm mb-2">
                <div>Sr. {idx + 1}</div>
                <div className="text-right font-semibold">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleServiceChange(row.id, "description", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  placeholder={`Description ${idx + 1}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleServiceChange(row.id, "qty", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm text-right"
                  min="0"
                />
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleServiceChange(row.id, "rate", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm text-right"
                  min="0"
                  step="0.01"
                />
              </div>
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
            <span className="text-base font-semibold">₹ {formattedTotal}</span>
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
