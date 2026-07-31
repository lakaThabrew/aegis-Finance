import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import axios from 'axios';
import { CheckCircle, Loader2, MoreVertical, Pencil, Plus, Search, Shield, ShieldAlert, Trash2, Users, X } from 'lucide-react';
import api from '../api/client';

type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

interface CustomerProfile {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  verificationStatus: VerificationStatus;
  riskScore: number;
  createdAt: string;
}

interface CustomerForm {
  customerId: string;
  fullName: string;
  email: string;
  verificationStatus: VerificationStatus;
  riskScore: number;
}

const emptyForm: CustomerForm = {
  customerId: '',
  fullName: '',
  email: '',
  verificationStatus: 'PENDING',
  riskScore: 0,
};

function statusClasses(status: VerificationStatus) {
  if (status === 'VERIFIED') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  if (status === 'PENDING') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  return 'bg-red-500/10 border-red-500/20 text-red-400';
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as { detail?: string; message?: string } | undefined;
    return response?.detail ?? response?.message ?? fallback;
  }
  return fallback;
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [menuCustomerId, setMenuCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<CustomerProfile[]>('/api/v1/core/admin/customers');
      setCustomers(response.data);
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to load customers.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.customerId].some((value) => value.toLowerCase().includes(query)),
    );
  }, [customers, search]);

  const verifiedCount = customers.filter((customer) => customer.verificationStatus === 'VERIFIED').length;
  const pendingCount = customers.filter((customer) => customer.verificationStatus === 'PENDING').length;
  const highRiskCount = customers.filter((customer) => customer.riskScore >= 70).length;

  function openCreateForm() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setError(null);
  }

  function openEditForm(customer: CustomerProfile) {
    setEditingCustomer(customer);
    setForm({
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email,
      verificationStatus: customer.verificationStatus,
      riskScore: customer.riskScore,
    });
    setIsFormOpen(true);
    setMenuCustomerId(null);
    setError(null);
  }

  function closeForm() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingCustomer) {
        await api.put(`/api/v1/core/admin/customers/${editingCustomer.id}`, {
          fullName: form.fullName,
          email: form.email,
          verificationStatus: form.verificationStatus,
          riskScore: form.riskScore,
        });
      } else {
        await api.post('/api/v1/core/admin/customers', form);
      }
      closeForm();
      await loadCustomers();
    } catch (requestError) {
      setError(errorMessage(requestError, `Unable to ${editingCustomer ? 'update' : 'add'} customer.`));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer: CustomerProfile) {
    setMenuCustomerId(null);
    if (!window.confirm(`Delete ${customer.fullName}? Their banking history will be retained for audit purposes.`)) return;

    setDeletingId(customer.id);
    setError(null);
    try {
      await api.delete(`/api/v1/core/admin/customers/${customer.id}`);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to delete customer.'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-enter space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Customer Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage banking customer profiles, verification status, and risk.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search name, email, or ID..."
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <StatCard label="Total Customers" value={customers.length} icon={<Users className="w-5 h-5 text-blue-400" />} />
        <StatCard label="KYC Verified" value={verifiedCount} accent="text-emerald-400" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} />
        <StatCard label="Pending Review" value={pendingCount} accent="text-amber-400" icon={<Shield className="w-5 h-5 text-amber-400" />} />
        <StatCard label="High Risk" value={highRiskCount} accent="text-red-400" icon={<ShieldAlert className="w-5 h-5 text-red-400" />} />
      </div>

      <div className="glass rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-black/20 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 font-medium">KYC Status</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No customers found.</td></tr>
              ) : filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{customer.fullName}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{customer.customerId}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${statusClasses(customer.verificationStatus)}`}>{customer.verificationStatus}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${customer.riskScore >= 70 ? 'bg-red-500' : customer.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${customer.riskScore}%` }} /></div>
                      <span className={`text-xs font-bold ${customer.riskScore >= 70 ? 'text-red-400' : customer.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{customer.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuCustomerId((current) => current === customer.id ? null : customer.id)} className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10" aria-label={`Actions for ${customer.fullName}`}><MoreVertical className="w-4 h-4" /></button>
                      {menuCustomerId === customer.id && (
                        <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-xl border border-white/10 bg-[#171326] py-1 text-left shadow-xl">
                          <button onClick={() => openEditForm(customer)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                          <button onClick={() => void deleteCustomer(customer)} disabled={deletingId === customer.id} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitForm} className="glass-strong w-full max-w-xl rounded-2xl p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold text-white">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2><p className="mt-1 text-sm text-gray-400">{editingCustomer ? 'Update this customer profile.' : 'Create a banking customer profile.'}</p></div>
              <button type="button" onClick={closeForm} className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="input" /></Field>
              <Field label="Email"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input" /></Field>
              <Field label="Customer ID"><input required disabled={Boolean(editingCustomer)} value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} placeholder="customer-008" className="input disabled:cursor-not-allowed disabled:opacity-60" /></Field>
              <Field label="KYC status"><select value={form.verificationStatus} onChange={(event) => setForm({ ...form, verificationStatus: event.target.value as VerificationStatus })} className="input"><option value="PENDING">PENDING</option><option value="VERIFIED">VERIFIED</option><option value="REJECTED">REJECTED</option></select></Field>
              <Field label="Risk score (0–100)"><input required type="number" min="0" max="100" value={form.riskScore} onChange={(event) => setForm({ ...form, riskScore: Number(event.target.value) })} className="input" /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/5">Cancel</button><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingCustomer ? 'Save changes' : 'Add customer'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent = 'text-white' }: { label: string; value: number; icon: ReactNode; accent?: string }) {
  return <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between"><div><p className="text-sm text-gray-400 mb-1">{label}</p><p className={`text-2xl font-bold ${accent}`}>{value}</p></div><div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">{icon}</div></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm text-gray-300"><span className="mb-1.5 block">{label}</span>{children}</label>;
}
