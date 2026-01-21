import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Building2, FileText, ShoppingCart, Star, Plus, Search } from 'lucide-react';

interface Vendor { id: string; vendor_code: string; vendor_name: string; email: string; contact_person: string; approval_status: string; status: string; }
interface PO { id: string; po_number: string; po_date: string; total_amount: number; status: string; }
interface PR { id: string; pr_number: string; pr_date: string; item: string; quantity: number; from_department: string; status: string; }

const Purchase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'requisitions' | 'orders' | 'evaluations'>('vendors');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: async () => { const res = await api.get('/api/purchase/vendors'); return res.data; } });
  const { data: requisitions = [] } = useQuery({ queryKey: ['requisitions'], queryFn: async () => { const res = await api.get('/api/purchase/requisitions'); return res.data; } });
  const { data: orders = [] } = useQuery({ queryKey: ['purchase-orders'], queryFn: async () => { const res = await api.get('/api/purchase/orders'); return res.data; } });
  const { data: stats } = useQuery({ queryKey: ['purchase-stats'], queryFn: async () => { const res = await api.get('/api/purchase/stats'); return res.data; } });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Purchase Department</h1><p>Vendors, requisitions, and purchase orders</p></div>
        <button className="btn btn-primary"><Plus size={20} /> Add Vendor</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><Building2 size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_vendors || 0}</div><div className="stat-label">Total Vendors</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><Building2 size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.approved_vendors || 0}</div><div className="stat-label">Approved Vendors</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><FileText size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pending_requisitions || 0}</div><div className="stat-label">Pending PRs</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#f3e5f5' }}><ShoppingCart size={24} color="#7b1fa2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.draft_orders || 0}</div><div className="stat-label">Draft POs</div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}><Building2 size={18} /> Vendors</button>
        <button className={`tab ${activeTab === 'requisitions' ? 'active' : ''}`} onClick={() => setActiveTab('requisitions')}><FileText size={18} /> Requisitions</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><ShoppingCart size={18} /> Purchase Orders</button>
        <button className={`tab ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Star size={18} /> Evaluations</button>
      </div>

      <div className="search-bar"><Search size={20} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      {activeTab === 'vendors' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>Contact</th><th>Email</th><th>Approval</th><th>Status</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={6}>Loading...</td></tr> : vendors.length === 0 ? <tr><td colSpan={6}>No vendors found</td></tr> :
            vendors.map((v: Vendor) => (<tr key={v.id}><td>{v.vendor_code}</td><td>{v.vendor_name}</td><td>{v.contact_person}</td><td>{v.email}</td>
              <td><span className={`badge ${v.approval_status === 'Approved' ? 'badge-success' : v.approval_status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{v.approval_status}</span></td>
              <td><span className={`badge ${v.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{v.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'requisitions' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>PR Number</th><th>Date</th><th>Item</th><th>Qty</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>{requisitions.length === 0 ? <tr><td colSpan={6}>No requisitions found</td></tr> :
            requisitions.map((pr: PR) => (<tr key={pr.id}><td>{pr.pr_number}</td><td>{pr.pr_date}</td><td>{pr.item}</td><td>{pr.quantity}</td><td>{pr.from_department}</td>
              <td><span className={`badge ${pr.status === 'Approved' ? 'badge-success' : pr.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>{pr.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'orders' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>PO Number</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{orders.length === 0 ? <tr><td colSpan={4}>No purchase orders found</td></tr> :
            orders.map((po: PO) => (<tr key={po.id}><td>{po.po_number}</td><td>{po.po_date}</td><td>₹{po.total_amount?.toLocaleString()}</td>
              <td><span className={`badge ${po.status === 'Completed' ? 'badge-success' : po.status === 'Draft' ? 'badge-warning' : 'badge-info'}`}>{po.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'evaluations' && <div className="card"><p>Vendor Evaluation Records</p></div>}
    </div>
  );
};

export default Purchase;
