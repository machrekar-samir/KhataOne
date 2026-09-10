import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useApp } from "../context/useApp.js";

export default function AddCustomer() {
  const navigate = useNavigate();
  const { saveCustomer, notify } = useApp();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      notify("Customer name and mobile number are required.");
      return;
    }

    setLoading(true);

    try {
      saveCustomer({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        openingBalance: Number(form.openingBalance) || 0,
        outstanding: Number(form.openingBalance) || 0,
      });

      navigate("/customers");
    } catch (error) {
      console.error(error);
      notify("Failed to add customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#ddd5cf] bg-white shadow-sm">
        
        <div className="bg-[#701d2c] px-6 py-7 text-white">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-white/10">
              <UserPlus size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Add customer</h1>
              <p className="mt-1 text-sm text-white/75">
                Add a new customer to your KhataOne account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            
            <Field
              label="Customer name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter customer name"
            />

            <Field
              label="Mobile number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+91 9876543210"
            />
          </div>

          <div className="mt-5">
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="customer@email.com"
            />
          </div>

          <div className="mt-5">
            <Field
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter customer address"
            />
          </div>

          <div className="mt-5">
            <Field
              label="Opening balance"
              name="openingBalance"
              type="number"
              value={form.openingBalance}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#ebe7e3] pt-5">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="rounded-xl border border-[#d8d0ca] px-6 py-3 text-sm font-medium text-[#6d6565]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#701d2c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1523] disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#403a3a]">
        {label} {required && <span className="text-[#8f2039]">*</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d8d0ca] bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10"
      />
    </label>
  );
}