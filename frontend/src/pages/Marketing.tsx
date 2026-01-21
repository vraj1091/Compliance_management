import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Users, FileText, ShoppingCart, MessageSquare, Plus, Search } from 'lucide-react';

interface Customer { id: string; customer_code: string; customer_name: string; customer_type: string; city: string; contact_person: string; status: string; }
interface Order { id: string; oc_number: string; oc_date: string; product_generic_name: string; total_amount: number; status: string; }
interface Complaint { id: string; complaint_no: string; customer_name: string; complaint_details: string; receipt_date: string; status: string; severity: string; }

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'inquiries' | 'orders' | 'complaints'>('customers');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: async () => { const res = await api.get('/api/marketing/customers'); return res.data; } });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: async () => { const res = await api.get('/api/marketing/orders'); return res.data; } });
  const { data: complaints = [] } = useQuery({ queryKey: ['complaints'], queryFn: async () => { const res = await api.get('/api/marketing/complaints'); return res.data; } });
  const { data: stats } = useQuery({ queryKey: ['marketing-stats'], queryFn: async () => { const res = await api.get('/api/marketing/stats'); return res.data; } });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Marketing Department</h1><p>Customers, orders, and complaints management</p></div>
        <button className="btn btn-primary"><Plus size={20} /> Add Customer</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><Users size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_customers || 0}</div><div className="stat-label">Total Customers</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><FileText size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.open_inquiries || 0}</div><div className="stat-label">Open Inquiries</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><ShoppingCart size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pending_orders || 0}</div><div className="stat-label">Pending Orders</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ffebee' }}><MessageSquare size={24} color="#d32f2f" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.open_complaints || 0}</div><div className="stat-label">Open Complaints</div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users size={18} /> Customers</button>
        <button className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}><FileText size={18} /> Inquiries</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><ShoppingCart size={18} /> Orders</button>
        <button className={`tab ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}><MessageSquare size={18} /> Complaints</button>
      </div>

      <div className="search-bar"><Search size={20} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      {activeTab === 'customers' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>City</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={6}>Loading...</td></tr> : customers.length === 0 ? <tr><td colSpan={6}>No customers found</td></tr> :
            customers.map((c: Customer) => (<tr key={c.id}><td>{c.customer_code}</td><td>{c.customer_name}</td><td>{c.customer_type}</td><td>{c.city}</td><td>{c.contact_person}</td>
              <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'orders' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>OC Number</th><th>Date</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{orders.length === 0 ? <tr><td colSpan={5}>No orders found</td></tr> :
            orders.map((o: Order) => (<tr key={o.id}><td>{o.oc_number}</td><td>{o.oc_date}</td><td>{o.product_generic_name}</td><td>₹{o.total_amount?.toLocaleString()}</td>
              <td><span className={`badge ${o.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{o.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'complaints' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Complaint No</th><th>Customer</th><th>Details</th><th>Date</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>{complaints.length === 0 ? <tr><td colSpan={6}>No complaints found</td></tr> :
            complaints.map((c: Complaint) => (<tr key={c.id}><td>{c.complaint_no}</td><td>{c.customer_name}</td><td>{c.complaint_details?.substring(0, 50)}...</td><td>{c.receipt_date}</td>
              <td><span className={`badge ${c.severity === 'Critical' ? 'badge-danger' : c.severity === 'Major' ? 'badge-warning' : 'badge-info'}`}>{c.severity}</span></td>
              <td><span className={`badge ${c.status === 'Closed' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'inquiries' && <div className="card"><p>Inquiry Register</p></div>}
    </div>
  );
};

export default Marketing;
