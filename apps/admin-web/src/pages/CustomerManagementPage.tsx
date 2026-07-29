import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldAlert, CheckCircle, Ban, ArrowUpRight, MoreVertical } from 'lucide-react';
import api from '../api/client';

interface CustomerProfile {
  id: string;
  customerId: string;
  name: string;
  verificationStatus: string;
  riskScore: number;
  joinDate: string;
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([
    { id: '1', customerId: 'customer-001', name: 'Nimal Perera', verificationStatus: 'VERIFIED', riskScore: 10, joinDate: '2023-01-15' },
    { id: '2', customerId: 'customer-002', name: 'Sunil Silva', verificationStatus: 'PENDING', riskScore: 50, joinDate: '2023-06-22' },
    { id: '3', customerId: 'customer-045', name: 'Kamal Fernando', verificationStatus: 'REJECTED', riskScore: 95, joinDate: '2023-11-05' },
    { id: '4', customerId: 'customer-089', name: 'Saman Kumara', verificationStatus: 'VERIFIED', riskScore: 5, joinDate: '2022-09-11' },
    { id: '5', customerId: 'customer-102', name: 'Ruwan Rajapaksha', verificationStatus: 'VERIFIED', riskScore: 25, joinDate: '2024-01-30' },
  ]);

  return (
    <div className="page-enter space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Customer Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review profiles, identity verification status, and risks.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-white">12,458</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">KYC Verified</p>
            <p className="text-2xl font-bold text-emerald-400">11,200</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-amber-400">845</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">High Risk</p>
            <p className="text-2xl font-bold text-red-400">413</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
        </div>
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
              {customers.map((customer, idx) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{customer.customerId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      customer.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      customer.verificationStatus === 'PENDING' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                      'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                      {customer.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${customer.riskScore > 70 ? 'bg-red-500' : customer.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${customer.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${customer.riskScore > 70 ? 'text-red-400' : customer.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {customer.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(customer.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
