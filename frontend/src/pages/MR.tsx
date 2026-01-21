import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ClipboardCheck, FileText, AlertTriangle, Users, Plus, Search } from 'lucide-react';

interface AuditNote { id: string; audit_no: string; audit_date: string; department: string; auditor: string; nc_count: number; status: string; }
interface CAR { id: string; car_number: string; car_date: string; department: string; finding_type: string; status: string; }
interface DCR { id: string; dcr_number: string; dcr_date: string; document_title: string; request_type: string; status: string; }
interface MRM { id: string; meeting_no: string; meeting_date: string; agenda: string; status: string; }

const MR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audits' | 'car' | 'dcr' | 'mrm'>('audits');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: audits = [], isLoading } = useQuery({ queryKey: ['audit-notes'], queryFn: async () => { const res = await api.get('/api/mr/audit-notes'); return res.data; } });
  const { data: cars = [] } = useQuery({ queryKey: ['car'], queryFn: async () => { const res = await api.get('/api/mr/car'); return res.data; } });
  const { data: dcrs = [] } = useQuery({ queryKey: ['dcr'], queryFn: async () => { const res = await api.get('/api/mr/dcr'); return res.data; } });
  const { data: mrms = [] } = useQuery({ queryKey: ['mrm'], queryFn: async () => { const res = await api.get('/api/mr/mrm'); return res.data; } });
  const { data: stats } = useQuery({ queryKey: ['mr-stats'], queryFn: async () => { const res = await api.get('/api/mr/stats'); return res.data; } });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>MR / QA Department</h1><p>Internal audits, CARs, DCRs, and management reviews</p></div>
        <button className="btn btn-primary"><Plus size={20} /> New Audit</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><ClipboardCheck size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.open_audits || 0}</div><div className="stat-label">Open Audits</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ffebee' }}><AlertTriangle size={24} color="#d32f2f" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.open_car || 0}</div><div className="stat-label">Open CARs</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><FileText size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pending_dcr || 0}</div><div className="stat-label">Pending DCRs</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><Users size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_mrm || 0}</div><div className="stat-label">Total MRMs</div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'audits' ? 'active' : ''}`} onClick={() => setActiveTab('audits')}><ClipboardCheck size={18} /> Internal Audits</button>
        <button className={`tab ${activeTab === 'car' ? 'active' : ''}`} onClick={() => setActiveTab('car')}><AlertTriangle size={18} /> CARs</button>
        <button className={`tab ${activeTab === 'dcr' ? 'active' : ''}`} onClick={() => setActiveTab('dcr')}><FileText size={18} /> DCRs</button>
        <button className={`tab ${activeTab === 'mrm' ? 'active' : ''}`} onClick={() => setActiveTab('mrm')}><Users size={18} /> MRM</button>
      </div>

      <div className="search-bar"><Search size={20} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      {activeTab === 'audits' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Audit No</th><th>Date</th><th>Department</th><th>Auditor</th><th>NCs</th><th>Status</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={6}>Loading...</td></tr> : audits.length === 0 ? <tr><td colSpan={6}>No audits found</td></tr> :
            audits.map((a: AuditNote) => (<tr key={a.id}><td>{a.audit_no}</td><td>{a.audit_date}</td><td>{a.department}</td><td>{a.auditor}</td><td>{a.nc_count}</td>
              <td><span className={`badge ${a.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'car' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>CAR No</th><th>Date</th><th>Department</th><th>Finding Type</th><th>Status</th></tr></thead>
          <tbody>{cars.length === 0 ? <tr><td colSpan={5}>No CARs found</td></tr> :
            cars.map((c: CAR) => (<tr key={c.id}><td>{c.car_number}</td><td>{c.car_date}</td><td>{c.department}</td>
              <td><span className={`badge ${c.finding_type === 'Major' ? 'badge-danger' : 'badge-warning'}`}>{c.finding_type}</span></td>
              <td><span className={`badge ${c.status === 'Closed' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'dcr' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>DCR No</th><th>Date</th><th>Document</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>{dcrs.length === 0 ? <tr><td colSpan={5}>No DCRs found</td></tr> :
            dcrs.map((d: DCR) => (<tr key={d.id}><td>{d.dcr_number}</td><td>{d.dcr_date}</td><td>{d.document_title}</td><td>{d.request_type}</td>
              <td><span className={`badge ${d.status === 'Approved' ? 'badge-success' : d.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>{d.status}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'mrm' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Meeting No</th><th>Date</th><th>Agenda</th><th>Status</th></tr></thead>
          <tbody>{mrms.length === 0 ? <tr><td colSpan={4}>No MRMs found</td></tr> :
            mrms.map((m: MRM) => (<tr key={m.id}><td>{m.meeting_no}</td><td>{m.meeting_date}</td><td>{m.agenda?.substring(0, 50)}...</td>
              <td><span className={`badge ${m.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{m.status}</span></td></tr>))}</tbody>
        </table></div>
      )}
    </div>
  );
};

export default MR;
