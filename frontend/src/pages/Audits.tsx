import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ClipboardCheck, Search, Eye, Edit, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { auditsApi, usersApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Audit {
    id: string;
    audit_number: string;
    title: string;
    audit_type?: string;
    scope?: string;
    start_date: string;
    end_date?: string;
    auditee_department?: string;
    led_by: string;
    status: string;
    created_at: string;
}

const Audits: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

    // Fetch audits
    const { data: audits = [], isLoading } = useQuery({
        queryKey: ['audits', statusFilter],
        queryFn: () => auditsApi.getAll({ status: statusFilter || undefined }),
    });

    // Fetch users for dropdown
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: auditsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audits'] });
            setShowCreateModal(false);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => auditsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audits'] });
            setShowEditModal(false);
            setSelectedAudit(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: auditsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audits'] });
            setSelectedAudit(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            audit_type: formData.get('audit_type'),
            scope: formData.get('scope') || null,
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date') || null,
            auditee_department: formData.get('auditee_department') || null,
            led_by: formData.get('led_by'),
            status: 'Planned',
        };
        createMutation.mutate(data);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedAudit) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            audit_type: formData.get('audit_type'),
            scope: formData.get('scope') || null,
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date') || null,
            auditee_department: formData.get('auditee_department') || null,
            led_by: formData.get('led_by'),
            status: formData.get('status'),
        };
        updateMutation.mutate({ id: selectedAudit.id, data });
    };

    const handleView = (audit: Audit) => {
        setSelectedAudit(audit);
        setShowViewModal(true);
    };

    const handleEdit = (audit: Audit) => {
        setSelectedAudit(audit);
        setShowEditModal(true);
    };

    const handleDelete = (audit: Audit) => {
        setSelectedAudit(audit);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedAudit) {
            deleteMutation.mutate(selectedAudit.id);
        }
    };

    const filteredAudits = audits.filter(
        (audit: Audit) =>
            audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audit.audit_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Planned: 'badge-info',
            'In Progress': 'badge-warning',
            Completed: 'badge-success',
            Cancelled: 'badge-error',
        };
        return classes[status] || 'badge-gray';
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Audit Management</h2>
                    <p className="text-muted text-sm mt-1">
                        Schedule and manage internal and external audits
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Schedule Audit
                </button>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <ClipboardCheck size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Audits</div>
                        <div className="kpi-value">{audits.length}</div>
                        <div className="text-xs text-success mt-1">↑ +15% vs last year</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <Calendar size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Scheduled</div>
                        <div className="kpi-value">
                            {audits.filter((a: Audit) => a.status === 'Planned').length}
                        </div>
                        <div className="text-xs text-success mt-1">↑ +3% vs last year</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon info">
                        <ClipboardCheck size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">In Progress</div>
                        <div className="kpi-value">
                            {audits.filter((a: Audit) => a.status === 'In Progress').length}
                        </div>
                        <div className="text-xs text-muted mt-1">No change</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Completed (YTD)</div>
                        <div className="kpi-value">
                            {audits.filter((a: Audit) => a.status === 'Completed').length}
                        </div>
                        <div className="text-xs text-success mt-1">↑ +22% vs last year</div>
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
                                placeholder="Search audits..."
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
                            <option value="Planned">Planned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Audits Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <ClipboardCheck size={20} style={{ marginRight: '0.5rem' }} />
                        Audits ({filteredAudits.length})
                    </h3>
                </div>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Audit #</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Auditee</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAudits.map((audit: Audit) => (
                                <tr key={audit.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                                            {audit.audit_number}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{audit.title}</div>
                                            {audit.scope && (
                                                <div className="text-muted text-sm">Scope: {audit.scope}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-gray">{audit.audit_type || 'N/A'}</span>
                                    </td>
                                    <td className="text-sm">{audit.auditee_department || '-'}</td>
                                    <td className="text-sm">
                                        {new Date(audit.start_date).toLocaleDateString()}
                                        {audit.end_date && (
                                            <div className="text-muted">
                                                to {new Date(audit.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(audit.status)}`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(audit)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleEdit(audit)}
                                                title="Edit Audit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleDelete(audit)}
                                                title="Delete Audit"
                                            >
                                                <Trash2 size={16} />
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
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Schedule Audit"
                size="lg"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                placeholder="Audit title"
                                required
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Audit Type *</label>
                                <select name="audit_type" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    <option value="Internal">Internal</option>
                                    <option value="External">External</option>
                                    <option value="Supplier">Supplier</option>
                                    <option value="Regulatory">Regulatory</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lead Auditor *</label>
                                <select name="led_by" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Scope</label>
                            <textarea
                                name="scope"
                                className="form-input"
                                rows={2}
                                placeholder="Audit scope..."
                            ></textarea>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Start Date *</label>
                                <input type="date" name="start_date" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input type="date" name="end_date" className="form-input" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Auditee Department</label>
                            <input
                                type="text"
                                name="auditee_department"
                                className="form-input"
                                placeholder="Department or organization"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Scheduling...' : 'Schedule Audit'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            {selectedAudit && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedAudit(null);
                    }}
                    title="Edit Audit"
                    size="lg"
                >
                    <form onSubmit={handleEditSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    defaultValue={selectedAudit.title}
                                    required
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Audit Type *</label>
                                    <select
                                        name="audit_type"
                                        className="form-input form-select"
                                        defaultValue={selectedAudit.audit_type}
                                        required
                                    >
                                        <option value="">Select...</option>
                                        <option value="Internal">Internal</option>
                                        <option value="External">External</option>
                                        <option value="Supplier">Supplier</option>
                                        <option value="Regulatory">Regulatory</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Lead Auditor *</label>
                                    <select
                                        name="led_by"
                                        className="form-input form-select"
                                        defaultValue={selectedAudit.led_by}
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {users.map((user: any) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name || user.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Scope</label>
                                <textarea
                                    name="scope"
                                    className="form-input"
                                    rows={2}
                                    defaultValue={selectedAudit.scope || ''}
                                ></textarea>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        className="form-input"
                                        defaultValue={selectedAudit.start_date}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        className="form-input"
                                        defaultValue={selectedAudit.end_date || ''}
                                    />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Auditee Department</label>
                                    <input
                                        type="text"
                                        name="auditee_department"
                                        className="form-input"
                                        defaultValue={selectedAudit.auditee_department || ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-input form-select"
                                        defaultValue={selectedAudit.status}
                                    >
                                        <option value="Planned">Planned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedAudit(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Updating...' : 'Update Audit'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Modal */}
            {selectedAudit && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedAudit(null);
                    }}
                    title="Audit Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Audit Number
                                </label>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                                    {selectedAudit.audit_number}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedAudit.status)}`}>
                                        {selectedAudit.status}
                                    </span>
                                </p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Title
                                </label>
                                <p style={{ fontWeight: 500 }}>{selectedAudit.title}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Audit Type
                                </label>
                                <p>
                                    <span className="badge badge-gray">{selectedAudit.audit_type || 'N/A'}</span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Lead Auditor
                                </label>
                                <p>{selectedAudit.led_by}</p>
                            </div>
                            {selectedAudit.scope && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Scope
                                    </label>
                                    <p>{selectedAudit.scope}</p>
                                </div>
                            )}
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Start Date
                                </label>
                                <p>{new Date(selectedAudit.start_date).toLocaleDateString()}</p>
                            </div>
                            {selectedAudit.end_date && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        End Date
                                    </label>
                                    <p>{new Date(selectedAudit.end_date).toLocaleDateString()}</p>
                                </div>
                            )}
                            {selectedAudit.auditee_department && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Auditee Department
                                    </label>
                                    <p>{selectedAudit.auditee_department}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedAudit(null);
                            }}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowViewModal(false);
                                handleEdit(selectedAudit);
                            }}
                        >
                            <Edit size={16} />
                            Edit Audit
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedAudit(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Audit"
                message={`Are you sure you want to delete audit "${selectedAudit?.audit_number}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default Audits;
