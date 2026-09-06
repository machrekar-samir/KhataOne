import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { saveCustomer } = useApp();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter mobile number");
      return;
    }

    const balance = Number(form.openingBalance) || 0;

    saveCustomer({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      openingBalance: balance,
      outstanding: balance,
      createdAt: new Date().toISOString(),
    });

    navigate("/customers");
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <button
        onClick={() => navigate("/customers")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[#756d70] hover:text-[#8f2039]"
      >
        <ArrowLeft size={18} />
        Back to customers
      </button>

      <div className="overflow-hidden rounded-2xl border border-[#ddd5d0] bg-white shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">
        <div className="bg-[#65182b] px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-white/15">
              <UserPlus size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Add customer</h1>
              <p className="mt-1 text-sm text-white/70">
                Add a new customer to your KhataOne account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Customer name"
              name="name"
              placeholder="Enter customer name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <Field
            label="Email address"
            name="email"
            type="email"
            placeholder="customer@email.com"
            value={form.email}
            onChange={handleChange}
          />

          <Field
            label="Address"
            name="address"
            placeholder="Enter customer address"
            value={form.address}
            onChange={handleChange}
          />

          <Field
            label="Opening balance"
            name="openingBalance"
            type="number"
            placeholder="₹ 0"
            value={form.openingBalance}
            onChange={handleChange}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-[#ebe7e3] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="rounded-xl border border-[#ddd5d0] px-5 py-3 text-sm font-semibold text-[#756d70]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#8f2039] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#65182b]"
            >
              Add customer
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
  placeholder,
  value,
  onChange,
  required,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#40393b] dark:text-white">
        {label} {required && <span className="text-[#8f2039]">*</span>}
      </span>

      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[#ddd5d0] bg-white px-4 py-3 text-sm text-[#40393b] outline-none transition placeholder:text-[#aaa] focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10 dark:border-[#423238] dark:bg-[#342a2e] dark:text-white"
      />
    </label>
  );
}