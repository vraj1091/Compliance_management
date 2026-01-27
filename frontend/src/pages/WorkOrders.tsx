import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Factory, Search, Eye, Play, CheckCircle, Trash2 } from 'lucide-react';
import { workOrdersApi, itemsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface WorkOrder {
    id: string;
    work_order_number: string;
    item_id: string;
    quantity_ordered: number;
    quantity_completed: number;
    quantity_scrapped: number;
    priority: string;
    status: string;
    start_date?: string;
    scheduled_completion?: string;
    lot_number?: string;
    created_at: string;
}

const WorkOrders: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

    // Fetch work orders
    const { data: workOrders = [], isLoading } = useQuery({
        queryKey: ['work-orders', statusFilter],
        queryFn: () => workOrdersApi.getAll({ status: statusFilter || undefined }),
    });

    // Fetch items for dropdown
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => itemsApi.getAll(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: workOrdersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            setShowCreateModal(false);
        },
    });

    // Release mutation
    const releaseMutation = useMutation({
        mutationFn: workOrdersApi.release,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: workOrdersApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            setSelectedWO(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            item_id: formData.get('item_id'),
            quantity_ordered: Number(formData.get('quantity_ordered')),
            priority: formData.get('priority'),
            start_date: formData.get('start_date') || null,
            scheduled_completion: formData.get('scheduled_completion') || null,
            lot_number: formData.get('lot_number') || null,
            status: 'Planned',
        };
        createMutation.mutate(data);
    };

    const handleRelease = (wo: WorkOrder) => {
        releaseMutation.mutate(wo.id);
    };

    const handleView = (wo: WorkOrder) => {
        setSelectedWO(wo);
        setShowViewModal(true);
    };

    const handleDelete = (wo: WorkOrder) => {
        setSelectedWO(wo);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedWO) {
            deleteMutation.mutate(selectedWO.id);
        }
    };

    const filteredWorkOrders = workOrders.filter(
        (wo: WorkOrder) =>
            wo.work_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.item_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Planned: 'badge-gray',
            Released: 'badge-info',
            'In Progress': 'badge-warning',
            Completed: 'badge-success',
            Closed: 'badge-success',
            Cancelled: 'badge-error',
        };
        return classes[status] || 'badge-gray';
    };

    const getPriorityBadge = (priority: string) => {
        const classes: Record<string, string> = {
            High: 'badge-error',
            Normal: 'badge-info',
            Low: 'badge-gray',
        };
        return classes[priority] || 'badge-gray';
    };

    const getProgress = (wo: WorkOrder) => {
        if (wo.quantity_ordered === 0) return 0;
        return Math.round((wo.quantity_completed / wo.quantity_ordered) * 100);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Work Orders</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage manufacturing work orders and production
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    New Work Order
                </button>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <Factory size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Planned</div>
                        <div className="kpi-value">
                            {workOrders.filter((wo: WorkOrder) => wo.status === 'Planned').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <Factory size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">In Progress</div>
                        <div className="kpi-value">
                            {workOrders.filter((wo: WorkOrder) => wo.status === 'In Progress').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Completed (This Month)</div>
                        <div className="kpi-value">
                            {workOrders.filter((wo: WorkOrder) => wo.status === 'Completed').length}
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
                                placeholder="Search work orders..."
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
                            <option value="Released">Released</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Work Orders Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Factory size={20} style={{ marginRight: '0.5rem' }} />
                        Work Orders ({filteredWorkOrders.length})
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
                                <th>WO #</th>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Progress</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkOrders.map((wo: WorkOrder) => (
                                <tr key={wo.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                                            {wo.work_order_number}
                                        </span>
                                        {wo.lot_number && (
                                            <div className="text-muted text-xs">Lot: {wo.lot_number}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 500 }}>{wo.item_id}</span>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <div>
                                                {wo.quantity_completed} / {wo.quantity_ordered}
                                            </div>
                                            {wo.quantity_scrapped > 0 && (
                                                <div className="text-muted text-xs">
                                                    Scrapped: {wo.quantity_scrapped}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ width: '100px' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '0.75rem',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                <span>{getProgress(wo)}%</span>
                                            </div>
                                            <div
                                                style={{
                                                    height: '6px',
                                                    backgroundColor: 'var(--gray-200)',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${getProgress(wo)}%`,
                                                        backgroundColor:
                                                            getProgress(wo) === 100
                                                                ? 'var(--success-500)'
                                                                : 'var(--primary-500)',
                                                        borderRadius: '3px',
                                                        transition: 'width 0.3s ease',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getPriorityBadge(wo.priority)}`}>
                                            {wo.priority}
                                        </span>
                                    </td>
                                    <td className="text-sm">
                                        {wo.scheduled_completion
                                            ? new Date(wo.scheduled_completion).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(wo.status)}`}>
                                            {wo.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(wo)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {wo.status === 'Planned' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleRelease(wo)}
                                                    disabled={releaseMutation.isPending}
                                                    title="Release Work Order"
                                                >
                                                    <Play size={16} />
                                                    Release
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleDelete(wo)}
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
                title="Create Work Order"
                size="lg"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Item *</label>
                            <select name="item_id" className="form-input form-select" required>
                                <option value="">Select item...</option>
                                {items.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.item_code} - {item.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity_ordered"
                                    className="form-input"
                                    placeholder="100"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select name="priority" className="form-input form-select">
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input type="date" name="start_date" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input type="date" name="scheduled_completion" className="form-input" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Lot Number</label>
                            <input
                                type="text"
                                name="lot_number"
                                className="form-input"
                                placeholder="2024-XXX"
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
                            {createMutation.isPending ? 'Creating...' : 'Create Work Order'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            {selectedWO && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedWO(null);
                    }}
                    title="Work Order Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Work Order #
                                </label>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                                    {selectedWO.work_order_number}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedWO.status)}`}>
                                        {selectedWO.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Item
                                </label>
                                <p style={{ fontWeight: 500 }}>{selectedWO.item_id}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Priority
                                </label>
                                <p>
                                    <span className={`badge ${getPriorityBadge(selectedWO.priority)}`}>
                                        {selectedWO.priority}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Quantity Ordered
                                </label>
                                <p>{selectedWO.quantity_ordered}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Quantity Completed
                                </label>
                                <p>{selectedWO.quantity_completed}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Quantity Scrapped
                                </label>
                                <p>{selectedWO.quantity_scrapped}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Progress
                                </label>
                                <p>{getProgress(selectedWO)}%</p>
                            </div>
                            {selectedWO.lot_number && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Lot Number
                                    </label>
                                    <p>{selectedWO.lot_number}</p>
                                </div>
                            )}
                            {selectedWO.start_date && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Start Date
                                    </label>
                                    <p>{new Date(selectedWO.start_date).toLocaleDateString()}</p>
                                </div>
                            )}
                            {selectedWO.scheduled_completion && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Due Date
                                    </label>
                                    <p>{new Date(selectedWO.scheduled_completion).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedWO(null);
                            }}
                        >
                            Close
                        </button>
                        {selectedWO.status === 'Planned' && (
                            <button
                                className="btn btn-success"
                                onClick={() => {
                                    handleRelease(selectedWO);
                                    setShowViewModal(false);
                                }}
                            >
                                <Play size={16} />
                                Release Work Order
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedWO(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Work Order"
                message={`Are you sure you want to delete work order "${selectedWO?.work_order_number}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default WorkOrders;
