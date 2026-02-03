import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Search, Eye, Edit, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { capaApi, ncApi, usersApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

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
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCAPA, setSelectedCAPA] = useState<CAPA | null>(null);

    // Fetch CAPAs
    const { data: capas = [], isLoading } = useQuery({
        queryKey: ['capas', statusFilter],
        queryFn: () => capaApi.getAll({ status: statusFilter || undefined }),
    });

    // Fetch NCs for dropdown
    const { data: ncs = [] } = useQuery({
        queryKey: ['nonconformances'],
        queryFn: () => ncApi.getAll(),
    });

    // Fetch users for dropdown
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: capaApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['capas'] });
            setShowCreateModal(false);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => capaApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['capas'] });
            setShowEditModal(false);
            setSelectedCAPA(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            capa_type: formData.get('capa_type'),
            description: formData.get('description') || null,
            nc_id: formData.get('nc_id') || null,
            owner_id: formData.get('owner_id'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
            status: 'Open',
        };
        createMutation.mutate(data);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCAPA) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            capa_type: formData.get('capa_type'),
            description: formData.get('description') || null,
            nc_id: formData.get('nc_id') || null,
            owner_id: formData.get('owner_id'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
            status: formData.get('status'),
        };
        updateMutation.mutate({ id: selectedCAPA.id, data });
    };

    const handleView = (capa: CAPA) => {
        setSelectedCAPA(capa);
        setShowViewModal(true);
    };

    const handleEdit = (capa: CAPA) => {
        setSelectedCAPA(capa);
        setShowEditModal(true);
    };

    const handleDelete = (capa: CAPA) => {
        setSelectedCAPA(capa);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedCAPA) {
            // Note: Delete functionality needs to be added to the API
            console.log('Delete CAPA:', selectedCAPA.id);
            setShowDeleteDialog(false);
            setSelectedCAPA(null);
        }
    };

    const filteredCAPAs = capas.filter(
        (capa: CAPA) =>
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
                        <div className="kpi-label">Total CAPAs</div>
                        <div className="kpi-value">{capas.length}</div>
                        <div className="text-xs text-success mt-1">↑ +18% vs last year</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <AlertCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active CAPAs</div>
                        <div className="kpi-value">
                            {capas.filter((c: CAPA) => c.status === 'Open' || c.status === 'In Progress').length}
                        </div>
                        <div className="text-xs text-success mt-1">↑ +7% vs last year</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <Calendar size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Overdue</div>
                        <div className="kpi-value">
                            {capas.filter((c: CAPA) => isOverdue(c.due_date) && c.status !== 'Closed').length}
                        </div>
                        <div className="text-xs text-error mt-1">↑ +3 from last month</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Closed (YTD)</div>
                        <div className="kpi-value">
                            {capas.filter((c: CAPA) => c.status === 'Closed').length}
                        </div>
                        <div className="text-xs text-success mt-1">↑ +25% vs last year</div>
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
                {isLoading ? (
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
                            {filteredCAPAs.map((capa: CAPA) => (
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
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(capa)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleEdit(capa)}
                                                title="Edit CAPA"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleDelete(capa)}
                                                title="Delete"
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
                title="Create CAPA"
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
                                placeholder="CAPA title"
                                required
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Type *</label>
                                <select name="capa_type" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    <option value="Corrective">Corrective Action</option>
                                    <option value="Preventive">Preventive Action</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority *</label>
                                <select name="priority" className="form-input form-select" required>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows={3}
                                placeholder="Describe the corrective/preventive action..."
                            ></textarea>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Related NC</label>
                                <select name="nc_id" className="form-input form-select">
                                    <option value="">None</option>
                                    {ncs.map((nc: any) => (
                                        <option key={nc.id} value={nc.id}>
                                            {nc.nc_number} - {nc.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Owner *</label>
                                <select name="owner_id" className="form-input form-select" required>
                                    <option value="">Select owner...</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date *</label>
                            <input type="date" name="due_date" className="form-input" required />
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
                            {createMutation.isPending ? 'Creating...' : 'Create CAPA'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            {selectedCAPA && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedCAPA(null);
                    }}
                    title="CAPA Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    CAPA Number
                                </label>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                                    {selectedCAPA.capa_number}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedCAPA.status)}`}>
                                        {selectedCAPA.status}
                                    </span>
                                </p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Title
                                </label>
                                <p style={{ fontWeight: 500 }}>{selectedCAPA.title}</p>
                            </div>
                            {selectedCAPA.description && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Description
                                    </label>
                                    <p>{selectedCAPA.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Type
                                </label>
                                <p>
                                    <span className="badge badge-gray">{selectedCAPA.capa_type || 'N/A'}</span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Priority
                                </label>
                                <p>
                                    <span className={`badge ${getPriorityBadge(selectedCAPA.priority)}`}>
                                        {selectedCAPA.priority}
                                    </span>
                                </p>
                            </div>
                            {selectedCAPA.due_date && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Due Date
                                    </label>
                                    <p>{new Date(selectedCAPA.due_date).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedCAPA(null);
                            }}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowViewModal(false);
                                handleEdit(selectedCAPA);
                            }}
                        >
                            <Edit size={16} />
                            Edit CAPA
                        </button>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {selectedCAPA && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCAPA(null);
                    }}
                    title="Edit CAPA"
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
                                    defaultValue={selectedCAPA.title}
                                    required
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Type *</label>
                                    <select
                                        name="capa_type"
                                        className="form-input form-select"
                                        defaultValue={selectedCAPA.capa_type}
                                        required
                                    >
                                        <option value="">Select...</option>
                                        <option value="Corrective">Corrective Action</option>
                                        <option value="Preventive">Preventive Action</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority *</label>
                                    <select
                                        name="priority"
                                        className="form-input form-select"
                                        defaultValue={selectedCAPA.priority}
                                        required
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-input"
                                    rows={3}
                                    defaultValue={selectedCAPA.description || ''}
                                ></textarea>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Related NC</label>
                                    <select
                                        name="nc_id"
                                        className="form-input form-select"
                                        defaultValue={selectedCAPA.nc_id || ''}
                                    >
                                        <option value="">None</option>
                                        {ncs.map((nc: any) => (
                                            <option key={nc.id} value={nc.id}>
                                                {nc.nc_number} - {nc.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Owner *</label>
                                    <select
                                        name="owner_id"
                                        className="form-input form-select"
                                        defaultValue={selectedCAPA.owner_id}
                                        required
                                    >
                                        <option value="">Select owner...</option>
                                        {users.map((user: any) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name || user.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Due Date *</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        className="form-input"
                                        defaultValue={selectedCAPA.due_date || ''}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-input form-select"
                                        defaultValue={selectedCAPA.status}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Pending Verification">Pending Verification</option>
                                        <option value="Pending Effectiveness">Pending Effectiveness</option>
                                        <option value="Closed">Closed</option>
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
                                    setSelectedCAPA(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Updating...' : 'Update CAPA'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedCAPA(null);
                }}
                onConfirm={confirmDelete}
                title="Delete CAPA"
                message={`Are you sure you want to delete CAPA "${selectedCAPA?.capa_number}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default CAPAs;
