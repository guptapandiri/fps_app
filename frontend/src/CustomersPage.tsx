import { useState, useEffect } from "react";
import { getCustomersUrl, getCustomerUrl } from "./utils/api";

interface Customer {
  id: string;
  name: string;
  rcNumber: string;
  phone: string;
  address: string;
  shop_no?: number;
  aadhar?: string;
  kgs?: number;
}

interface FormState {
  name: string;
  rcNumber: string;
  phone: string;
  address: string;
  shop_no: string;
  aadhar: string;
  kgs: string;
}

const emptyForm: FormState = {
  name: "", rcNumber: "", phone: "", address: "",
  shop_no: "", aadhar: "", kgs: "",
};

type FormMode = "add" | "edit";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getCustomersUrl());
      if (!res.ok) throw new Error("Failed to load customers");
      const json = await res.json();
      setCustomers(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddClick = () => {
    setFormMode("add");
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError(null);
    setShowForm(true);
  };

  const handleEditClick = (customer: Customer) => {
    setFormMode("edit");
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      rcNumber: customer.rcNumber,
      phone: customer.phone ?? "",
      address: customer.address,
      shop_no: customer.shop_no?.toString() ?? "",
      aadhar: customer.aadhar ?? "",
      kgs: customer.kgs?.toString() ?? "",
    });
    setSubmitError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setSubmitError("Name is required.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const isEdit = formMode === "edit" && editingId;
      const url = isEdit ? getCustomerUrl(editingId) : getCustomersUrl();
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...form,
        shop_no: form.shop_no.trim() ? parseInt(form.shop_no, 10) : undefined,
        kgs: form.kgs.trim() ? parseFloat(form.kgs) : undefined,
        aadhar: form.aadhar.trim() || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || `Failed to ${isEdit ? "update" : "add"} customer`);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      await fetchCustomers();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setSubmitError(null);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(getCustomerUrl(id), { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to delete customer");
      }
      await fetchCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <span>Customers {!loading && `(${customers.length})`}</span>
          {!showForm && (
            <button className="btn-primary" onClick={handleAddClick}>
              + Add Customer
            </button>
          )}
        </div>

        {showForm && (
          <form className="customer-form" onSubmit={handleSubmit}>
            <h3 className="form-heading">
              {formMode === "edit" ? "Edit Customer" : "New Customer"}
            </h3>

            {submitError && (
              <div className="form-error">{submitError}</div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Name *</label>
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="Customer name"
                />
              </div>
              <div className="form-field">
                <label htmlFor="rcNumber">RC Number</label>
                <input
                  id="rcNumber" name="rcNumber" type="text"
                  value={form.rcNumber} onChange={handleChange}
                  placeholder="Ration card number"
                />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone" name="phone" type="text"
                  value={form.phone} onChange={handleChange}
                  placeholder="Mobile number"
                />
              </div>
              <div className="form-field">
                <label htmlFor="address">Address</label>
                <input
                  id="address" name="address" type="text"
                  value={form.address} onChange={handleChange}
                  placeholder="Full address"
                />
              </div>
              <div className="form-field">
                <label htmlFor="shop_no">Shop No</label>
                <input
                  id="shop_no" name="shop_no" type="number"
                  value={form.shop_no} onChange={handleChange}
                  placeholder="Shop number"
                />
              </div>
              <div className="form-field">
                <label htmlFor="aadhar">Aadhar</label>
                <input
                  id="aadhar" name="aadhar" type="text"
                  inputMode="numeric"
                  value={form.aadhar} onChange={handleChange}
                  placeholder="12-digit Aadhar number"
                  maxLength={12}
                />
              </div>
              <div className="form-field">
                <label htmlFor="kgs">KGs</label>
                <input
                  id="kgs" name="kgs" type="number"
                  step="0.01"
                  value={form.kgs} onChange={handleChange}
                  placeholder="Kg allocation"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : formMode === "edit" ? "Update Customer" : "Save Customer"}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && (
          <div style={{ padding: "20px", color: "#856404", background: "#fff3cd", margin: "0 16px 16px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>RC Number</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Shop No</th>
                <th>Aadhar</th>
                <th>KGs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={8}>Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No customers yet. Add one above.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.rcNumber}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.address}</td>
                    <td>{c.shop_no ?? "—"}</td>
                    <td>{c.aadhar || "—"}</td>
                    <td>{c.kgs != null ? c.kgs : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditClick(c)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          title="Delete"
                        >
                          {deletingId === c.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
