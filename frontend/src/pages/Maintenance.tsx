import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Wrench, AlertCircle, CheckCircle, Calendar, Plus, Search } from 'lucide-react';

interface Equipment {
  id: string;
  equipment_id: string;
  equipment_name: string;
  make: string;
  location: string;
  status: string;
}

interface Breakdown {
  id: string;
  breakdown_no: string;
  machine_name: string;
  description: string;
  start_date: string;
  status: string;
}

const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'pm' | 'breakdowns'>('equipment');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => { const res = await api.get('/api/maintenance/equipment'); return res.data; },
  });

  const { data: breakdowns = [] } = useQuery({
    queryKey: ['breakdowns'],
    queryFn: async () => { const res = await api.get('/api/maintenance/breakdowns'); return res.data; },
  });

  const { data: stats } = useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: async () => { const res = await api.get('/api/maintenance/stats'); return res.data; },
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Maintenance Department</h1><p>Equipment, PM schedules, and breakdown tracking</p></div>
        <button className="btn btn-primary"><Plus size={20} /> Add Equipment</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}><Wrench size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_equipment || 0}</div>
            <div className="stat-label">Total Equipment</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}><CheckCircle size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.active_equipment || 0}</div>
            <div className="stat-label">Active Equipment</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}><AlertCircle size={24} color="#d32f2f" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.open_breakdowns || 0}</div>
            <div className="stat-label">Open Breakdowns</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}><Calendar size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.pm_due_this_month || 0}</div>
            <div className="stat-label">PM Due This Month</div></div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
          <Wrench size={18} /> Equipment
        </button>
        <button className={`tab ${activeTab === 'pm' ? 'active' : ''}`} onClick={() => setActiveTab('pm')}>
          <Calendar size={18} /> Preventive Maintenance
        </button>
        <button className={`tab ${activeTab === 'breakdowns' ? 'active' : ''}`} onClick={() => setActiveTab('breakdowns')}>
          <AlertCircle size={18} /> Breakdowns
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {activeTab === 'equipment' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Equipment ID</th><th>Name</th><th>Make</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={5}>Loading...</td></tr> :
                equipment.length === 0 ? <tr><td colSpan={5}>No equipment found</td></tr> :
                equipment.map((eq: Equipment) => (
                  <tr key={eq.id}>
                    <td>{eq.equipment_id}</td><td>{eq.equipment_name}</td><td>{eq.make}</td><td>{eq.location}</td>
                    <td><span className={`badge ${eq.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{eq.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'breakdowns' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Breakdown No</th><th>Machine</th><th>Description</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {breakdowns.length === 0 ? <tr><td colSpan={5}>No breakdowns found</td></tr> :
                breakdowns.map((bd: Breakdown) => (
                  <tr key={bd.id}>
                    <td>{bd.breakdown_no}</td><td>{bd.machine_name}</td><td>{bd.description}</td><td>{bd.start_date}</td>
                    <td><span className={`badge ${bd.status === 'Closed' ? 'badge-success' : 'badge-danger'}`}>{bd.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pm' && <div className="card"><p>Preventive Maintenance Schedule</p></div>}
    </div>
  );
};

export default Maintenance;
