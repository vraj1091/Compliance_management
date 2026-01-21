import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Package, ArrowDownToLine, ArrowUpFromLine, FileText, Plus, Search } from 'lucide-react';

interface MaterialInward { id: string; grn_number: string; item_name: string; quantity: number; party_name: string; inward_date: string; qc_status: string; }
interface IndentSlip { id: string; indent_number: string; item_name: string; qty_required: number; requesting_department: string; indent_date: string; status: string; }
interface Outward { id: string; outward_number: string; item_name: string; customer_name: string; dispatch_qty: number; outward_date: string; }

const Store: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inward' | 'indent' | 'outward' | 'stock'>('inward');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inward = [], isLoading } = useQuery({ queryKey: ['material-inward'], queryFn: async () => { const res = await api.get('/api/store/material-inward'); return res.data; } });
  const { data: indents = [] } = useQuery({ queryKey: ['indent-slips'], queryFn: async () => { const res = await api.get('/api/store/indent-slips'); return res.data; } });
  const { data: outward = [] } = useQuery({ queryKey: ['outward'], queryFn: async () => { const res = await api.get('/api/store/outward'); return res.data; } });
  const { data: stats } = useQuery({ queryKey: ['store-stats'], queryFn: async () => { const res = await api.get('/api/store/stats'); return res.data; } });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Store Department</h1><p>Material inward, indent, and dispatch management</p></div>
        <button className="btn btn-primary"><Plus size={20} /> New GRN</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><ArrowDownToLine size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_grn || 0}</div><div className="stat-label">Total GRN</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><Package size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pending_qc || 0}</div><div className="stat-label">Pending QC</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#f3e5f5' }}><FileText size={24} color="#7b1fa2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pending_indents || 0}</div><div className="stat-label">Pending Indents</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><ArrowUpFromLine size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_dispatches || 0}</div><div className="stat-label">Total Dispatches</div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'inward' ? 'active' : ''}`} onClick={() => setActiveTab('inward')}><ArrowDownToLine size={18} /> Material Inward</button>
        <button className={`tab ${activeTab === 'indent' ? 'active' : ''}`} onClick={() => setActiveTab('indent')}><FileText size={18} /> Indent Slips</button>
        <button className={`tab ${activeTab === 'outward' ? 'active' : ''}`} onClick={() => setActiveTab('outward')}><ArrowUpFromLine size={18} /> Outward</button>
        <button className={`tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}><Package size={18} /> Stock Register</button>
      </div>

      <div className="search-bar"><Search size={20} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      {activeTab === 'inward' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>GRN No</th><th>Item</th><th>Qty</th><th>Party</th><th>Date</th><th>QC Status</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={6}>Loading...</td></tr> : inward.length === 0 ? <tr><td colSpan={6}>No records found</td></tr> :
            inward.map((m: MaterialInward) => (<tr key={m.id}><td>{m.grn_number}</td><td>{m.item_name}</td><td>{m.quantity}</td><td>{m.party_name}</td><td>{m.inward_date}</td>
              <td><span className={`badge ${m.qc_status === 'Approved' ? 'badge-success' : m.qc_status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{m.qc_status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'indent' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Indent No</th><th>Item</th><th>Qty Required</th><th>Department</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{indents.length === 0 ? <tr><td colSpan={6}>No indents found</td></tr> :
            indents.map((i: IndentSlip) => (<tr key={i.id}><td>{i.indent_number}</td><td>{i.item_name}</td><td>{i.qty_required}</td><td>{i.requesting_department}</td><td>{i.indent_date}</td>
              <td><span className={`badge ${i.status === 'Issued' ? 'badge-success' : 'badge-warning'}`}>{i.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'outward' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Outward No</th><th>Item</th><th>Customer</th><th>Qty</th><th>Date</th></tr></thead>
          <tbody>{outward.length === 0 ? <tr><td colSpan={5}>No dispatches found</td></tr> :
            outward.map((o: Outward) => (<tr key={o.id}><td>{o.outward_number}</td><td>{o.item_name}</td><td>{o.customer_name}</td><td>{o.dispatch_qty}</td><td>{o.outward_date}</td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'stock' && <div className="card"><p>Stock Register / Bin Cards</p></div>}
    </div>
  );
};

export default Store;
