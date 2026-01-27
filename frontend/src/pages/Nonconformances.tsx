import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Search, Eye, Trash2, ArrowRight } from 'lucide-react';
import { ncApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface NC {
    id: string;
    nc_number: string;
    title: string;
    description: string;
    severity?: string;
    source?: string;
    product_affected?: string;
    lot_number?: string;
    quantity_affected?: number;
    discovered_date: string;
    status: string;
    created_at: string;
}

const Nonconformances: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedNC, setSelectedNC] = useState<NC | null>(null);

    // Fetch NCs
    const { data: ncs = [], isLoading } = useQuery({
        queryKey: ['nonconformances', statusFilter],
        queryFn: () => ncApi.getAll({ status: statusFilter || undefined }),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: ncApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nonconformances'] });
            setShowCreateModal(false);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: ncApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nonconformances'] });
            setSelectedNC(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            severity: formData.get('severity'),
            source: formData.get('source') || null,
            product_affected: formData.get('product_affected') || null,
            lot_number: formData.get('lot_number') || null,
            quantity_affected: formData.get('quantity_affected') ? Number(formData.get('quantity_affected')) : null,
            discovered_date: formData.get('discovered_date'),
            status: 'Open',
        };
        createMutation.mutate(data);
    };

    const handleView = (nc: NC) => {
        setSelectedNC(nc);
        setShowViewModal(true);
    };

    const handleDelete = (nc: NC) => {
        setSelectedNC(nc);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedNC) {
            deleteMutation.mutate(selectedNC.id);
        }
    };

    const filteredNCs = ncs.filter(
        (nc: NC) =>
            nc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nc.nc_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Open: 'badge-error',
            'Under Investigation': 'badge-warning',
            'Pending Disposition': 'badge-warning',
            Closed: 'badge-success',
            Voided: 'badge-gray',
        };
        return classes[status] || 'badge-info';
    };

    const getSeverityBadge = (severity: string) => {
        const classes: Record<string, string> = {
            Critical: 'badge-error',
            Major: 'badge-warning',
            Minor: 'badge-info',
        };
        return classes[severity] || 'badge-gray';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Nonconformances</h2>
                    <p className="text-muted text-sm mt-1">Track and resolve quality nonconformances</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Report NC
                </button>
            </div>

            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open</div>
                        <div className="kpi-value">{ncs.filter((nc: NC) => nc.status === 'Open').length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Under Investigation</div>
                        <div className="kpi-value">
                            {ncs.filter((nc: NC) => nc.status === 'Under Investigation').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Closed (This Month)</div>
                        <div className="kpi-value">{ncs.filter((nc: NC) => nc.status === 'Closed').length}</div>
                    </div>
                </div>
            </div>

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
                                placeholder="Search nonconformances..."
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
                            <option value="Under Investigation">Under Investigation</option>
                            <option value="Pending Disposition">Pending Disposition</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
                        Nonconformances ({filteredNCs.length})
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
                                <th>NC #</th>
                                <th>Title</th>
                                <th>Severity</th>
                                <th>Source</th>
                                <th>Product / Lot</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNCs.map((nc: NC) => (
                                <tr key={nc.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--error-600)' }}>
                                            {nc.nc_number}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{nc.title}</div>
                                            <div className="text-muted text-sm" style={{ maxWidth: '300px' }}>
                                                {nc.description?.substring(0, 60)}...
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {nc.severity && (
                                            <span className={`badge ${getSeverityBadge(nc.severity)}`}>
                                                {nc.severity}
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-sm">{nc.source}</td>
                                    <td className="text-sm">
                                        <div>{nc.product_affected}</div>
                                        {nc.lot_number && <div className="text-muted">Lot: {nc.lot_number}</div>}
                                    </td>
                                    <td>{nc.quantity_affected || '-'}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(nc.status)}`}>{nc.status}</span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(nc)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleDelete(nc)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="btn btn-primary btn-sm" title="Create CAPA">
                                                <ArrowRight size={16} /> CAPA
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
                title="Report Nonconformance"
                size="lg"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    placeholder="Brief title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Severity *</label>
                                <select name="severity" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Major">Major</option>
                                    <option value="Minor">Minor</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows={3}
                                placeholder="Detailed description..."
                                required
                            ></textarea>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Source</label>
                                <select name="source" className="form-input form-select">
                                    <option value="">Select source...</option>
                                    <option value="Incoming Inspection">Incoming Inspection</option>
                                    <option value="In-Process Inspection">In-Process Inspection</option>
                                    <option value="Final Inspection">Final Inspection</option>
                                    <option value="Customer Complaint">Customer Complaint</option>
                                    <option value="Audit Finding">Audit Finding</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discovered Date *</label>
                                <input
                                    type="date"
                                    name="discovered_date"
                                    className="form-input"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Product Affected</label>
                                <input
                                    type="text"
                                    name="product_affected"
                                    className="form-input"
                                    placeholder="Item code"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lot Number</label>
                                <input type="text" name="lot_number" className="form-input" placeholder="Lot #" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity Affected</label>
                            <input type="number" name="quantity_affected" className="form-input" placeholder="0" />
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
                            {createMutation.isPending ? 'Creating...' : 'Create NC'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            {selectedNC && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedNC(null);
                    }}
                    title="Nonconformance Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    NC Number
                                </label>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--error-600)' }}>
                                    {selectedNC.nc_number}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedNC.status)}`}>
                                        {selectedNC.status}
                                    </span>
                                </p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Title
                                </label>
                                <p style={{ fontWeight: 500 }}>{selectedNC.title}</p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Description
                                </label>
                                <p>{selectedNC.description}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Severity
                                </label>
                                <p>
                                    {selectedNC.severity && (
                                        <span className={`badge ${getSeverityBadge(selectedNC.severity)}`}>
                                            {selectedNC.severity}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Source
                                </label>
                                <p>{selectedNC.source || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Product Affected
                                </label>
                                <p>{selectedNC.product_affected || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Lot Number
                                </label>
                                <p>{selectedNC.lot_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Quantity Affected
                                </label>
                                <p>{selectedNC.quantity_affected || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Discovered Date
                                </label>
                                <p>{new Date(selectedNC.discovered_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedNC(null);
                            }}
                        >
                            Close
                        </button>
                        <button className="btn btn-primary">
                            <ArrowRight size={16} />
                            Create CAPA
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedNC(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Nonconformance"
                message={`Are you sure you want to delete NC "${selectedNC?.nc_number}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default Nonconformances;
