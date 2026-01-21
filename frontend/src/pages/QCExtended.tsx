import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TestTube, Thermometer, Droplets, FlaskConical, Plus, Search } from 'lucide-react';

interface CalibrationRecord { id: string; equipment_type: string; equipment_id: string; calibration_date: string; result: string; next_calibration_date: string; }
interface RetainSample { id: string; batch_no: string; product_name: string; mfg_date: string; expiry_date: string; retain_qty: string; }
interface StabilityRecord { id: string; product_name: string; batch_no: string; test_duration: string; overall_result: string; }

const QCExtended: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calibration' | 'retain' | 'stability' | 'tests'>('calibration');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: calibrations = [], isLoading } = useQuery({ queryKey: ['calibrations'], queryFn: async () => { const res = await api.get('/api/qc-extended/calibrations'); return res.data; } });
  const { data: retainSamples = [] } = useQuery({ queryKey: ['retain-samples'], queryFn: async () => { const res = await api.get('/api/qc-extended/retain-samples'); return res.data; } });
  const { data: stability = [] } = useQuery({ queryKey: ['stability'], queryFn: async () => { const res = await api.get('/api/qc-extended/stability'); return res.data; } });
  const { data: stats } = useQuery({ queryKey: ['qc-extended-stats'], queryFn: async () => { const res = await api.get('/api/qc-extended/stats'); return res.data; } });

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>QC Lab Records</h1><p>Calibration, retain samples, stability studies, and lab tests</p></div>
        <button className="btn btn-primary"><Plus size={20} /> New Record</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e3f2fd' }}><Thermometer size={24} color="#1976d2" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.total_calibrations || 0}</div><div className="stat-label">Calibrations</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5e9' }}><FlaskConical size={24} color="#388e3c" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.retain_samples || 0}</div><div className="stat-label">Retain Samples</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fff3e0' }}><TestTube size={24} color="#f57c00" /></div>
          <div className="stat-content"><div className="stat-value">{stats?.stability_studies || 0}</div><div className="stat-label">Stability Studies</div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'calibration' ? 'active' : ''}`} onClick={() => setActiveTab('calibration')}><Thermometer size={18} /> Calibration</button>
        <button className={`tab ${activeTab === 'retain' ? 'active' : ''}`} onClick={() => setActiveTab('retain')}><FlaskConical size={18} /> Retain Samples</button>
        <button className={`tab ${activeTab === 'stability' ? 'active' : ''}`} onClick={() => setActiveTab('stability')}><TestTube size={18} /> Stability</button>
        <button className={`tab ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}><Droplets size={18} /> Lab Tests</button>
      </div>

      <div className="search-bar"><Search size={20} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      {activeTab === 'calibration' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Equipment Type</th><th>Equipment ID</th><th>Calibration Date</th><th>Result</th><th>Next Due</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={5}>Loading...</td></tr> : calibrations.length === 0 ? <tr><td colSpan={5}>No calibrations found</td></tr> :
            calibrations.map((c: CalibrationRecord) => (<tr key={c.id}><td>{c.equipment_type}</td><td>{c.equipment_id}</td><td>{c.calibration_date}</td>
              <td><span className={`badge ${c.result === 'Pass' ? 'badge-success' : 'badge-danger'}`}>{c.result}</span></td><td>{c.next_calibration_date}</td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'retain' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Batch No</th><th>Product</th><th>Mfg Date</th><th>Expiry</th><th>Qty</th></tr></thead>
          <tbody>{retainSamples.length === 0 ? <tr><td colSpan={5}>No retain samples found</td></tr> :
            retainSamples.map((r: RetainSample) => (<tr key={r.id}><td>{r.batch_no}</td><td>{r.product_name}</td><td>{r.mfg_date}</td><td>{r.expiry_date}</td><td>{r.retain_qty}</td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'stability' && (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>Product</th><th>Batch No</th><th>Duration</th><th>Result</th></tr></thead>
          <tbody>{stability.length === 0 ? <tr><td colSpan={4}>No stability records found</td></tr> :
            stability.map((s: StabilityRecord) => (<tr key={s.id}><td>{s.product_name}</td><td>{s.batch_no}</td><td>{s.test_duration}</td>
              <td><span className={`badge ${s.overall_result === 'Pass' ? 'badge-success' : s.overall_result === 'Fail' ? 'badge-danger' : 'badge-info'}`}>{s.overall_result || 'Ongoing'}</span></td></tr>))}</tbody>
        </table></div>
      )}

      {activeTab === 'tests' && (
        <div className="card">
          <h3>Lab Tests</h3>
          <p>Leak Tests, Fumigation, Distilled Water Tests, BET Records, and more</p>
        </div>
      )}
    </div>
  );
};

export default QCExtended;
