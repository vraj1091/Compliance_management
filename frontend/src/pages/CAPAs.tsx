import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, Search, Eye, Edit, Calendar, X } from 'lucide-react';
import { capaApi } from '../api';

interface CAPA {
    id: string;
    capa_number: string;
    title: string;
    capa_type?: string;
    description?: string;
    nc_id?: string;
    owner_id: string;
    priority: string;
    status: string;
    due_date?: string;
    created_at: string;
}

const CAPAs: React.FC = () => {
    const [capas, setCapas] = useState<CAPA[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadCAPAs();
    }, [statusFilter]);

    const loadCAPAs = async () => {
        try {
            const data = await capaApi.getAll({ status: statusFilter || undefined });
            setCapas(data);
        } catch (error) {
            console.error('Failed to load CAPAs:', error);
            // Demo data
            setCapas([
                {
                    id: 'capa-001',
                    capa_number: 'CAPA-2024-00001',
                    title: 'Supplier Quality Improvement',
                    capa_type: 'Corrective',
                    description: 'Implement supplier quality monitoring program',
                    nc_id: 'nc-001',
                    owner_id: 'user-qa-mgr',
                    priority: 'High',
                    status: 'In Progress',
                    due_date: '2026-02-04',
                    created_at: '2024-12-30T10:00:00Z',
                },
                {
                    id: 'capa-002',
                    capa_number: 'CAPA-2024-00002',
                    title: 'Label Verification Process',
                    capa_type: 'Preventive',
                    description: 'Enhanced label verification at final inspection',
                    owner_id: 'user-qa-eng',
                    priority: 'Medium',
                    status: 'Open',
                    due_date: '2026-01-20',
                    created_at: '2026-01-02T14:30:00Z',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCAPAs = capas.filter(
        (capa) =>
            capa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            capa.capa_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Open: 'badge-error',
            'In Progress': 'badge-warning',
            'Pending Verification': 'badge-info',
            'Pending Effectiveness': 'badge-info',
            Closed: 'badge-success',
        };
        return classes[status] || 'badge-gray';
    };

    const getPriorityBadge = (priority: string) => {
        const classes: Record<string, string> = {
            High: 'badge-error',
            Medium: 'badge-warning',
            Low: 'badge-info',
        };
        return classes[priority] || 'badge-gray';
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>CAPA Management</h2>
                    <p className="text-muted text-sm mt-1">
                        Corrective and Preventive Actions tracking
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    New CAPA
                </button>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open</div>
                        <div className="kpi-value">
                            {capas.filter((c) => c.status === 'Open').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">In Progress</div>
                        <div className="kpi-value">
                            {capas.filter((c) => c.status === 'In Progress').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <Calendar size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Overdue</div>
                        <div className="kpi-value">
                            {capas.filter((c) => isOverdue(c.due_date) && c.status !== 'Closed').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Closed (This Year)</div>
                        <div className="kpi-value">
                            {capas.filter((c) => c.status === 'Closed').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex gap-4">
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search CAPAs..."
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-input form-select"
                            style={{ width: '200px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CAPA Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                        CAPAs ({filteredCAPAs.length})
                    </h3>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>CAPA #</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCAPAs.map((capa) => (
                                <tr key={capa.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                                            {capa.capa_number}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{capa.title}</div>
                                            {capa.description && (
                                                <div className="text-muted text-sm">
                                                    {capa.description.substring(0, 50)}...
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-gray">{capa.capa_type || 'N/A'}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getPriorityBadge(capa.priority)}`}>
                                            {capa.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                color: isOverdue(capa.due_date) ? 'var(--error-600)' : 'inherit',
                                                fontWeight: isOverdue(capa.due_date) ? 500 : 'normal',
                                            }}
                                        >
                                            {capa.due_date
                                                ? new Date(capa.due_date).toLocaleDateString()
                                                : '-'}
                                            {isOverdue(capa.due_date) && capa.status !== 'Closed' && (
                                                <div className="text-xs" style={{ color: 'var(--error-600)' }}>
                                                    OVERDUE
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(capa.status)}`}>
                                            {capa.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-secondary btn-sm btn-icon">
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn btn-secondary btn-sm btn-icon">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create CAPA</h3>
                            <button
                                className="btn btn-secondary btn-icon"
                                onClick={() => setShowCreateModal(false)}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input type="text" className="form-input" placeholder="CAPA title" />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Type *</label>
                                    <select className="form-input form-select">
                                        <option value="">Select...</option>
                                        <option value="Corrective">Corrective Action</option>
                                        <option value="Preventive">Preventive Action</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority *</label>
                                    <select className="form-input form-select">
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Describe the corrective/preventive action..."
                                ></textarea>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Related NC</label>
                                    <select className="form-input form-select">
                                        <option value="">None</option>
                                        <option value="nc-001">NC-2024-00001</option>
                                        <option value="nc-002">NC-2024-00002</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Due Date *</label>
                                    <input type="date" className="form-input" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary">Create CAPA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CAPAs;
