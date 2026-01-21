import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { itemsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Item {
    id: string;
    item_code: string;
    description: string;
    item_type?: string;
    unit_of_measure: string;
    device_class?: string;
    udi?: string;
    item_revision: string;
    status: string;
    created_at: string;
}

const Items: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // Fetch items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items', typeFilter],
        queryFn: () => itemsApi.getAll({ item_type: typeFilter || undefined }),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: itemsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setShowCreateModal(false);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => itemsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setShowEditModal(false);
            setSelectedItem(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: itemsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setSelectedItem(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            item_code: formData.get('item_code'),
            description: formData.get('description'),
            item_type: formData.get('item_type'),
            unit_of_measure: formData.get('unit_of_measure'),
            device_class: formData.get('device_class') || null,
            udi: formData.get('udi') || null,
            item_revision: 'A',
            status: 'Active',
        };
        createMutation.mutate(data);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedItem) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            item_code: formData.get('item_code'),
            description: formData.get('description'),
            item_type: formData.get('item_type'),
            unit_of_measure: formData.get('unit_of_measure'),
            device_class: formData.get('device_class') || null,
            udi: formData.get('udi') || null,
            item_revision: formData.get('item_revision'),
            status: formData.get('status'),
        };
        updateMutation.mutate({ id: selectedItem.id, data });
    };

    const handleView = (item: Item) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    const handleEdit = (item: Item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (item: Item) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedItem) {
            deleteMutation.mutate(selectedItem.id);
        }
    };

    const filteredItems = items.filter(
        (item: Item) =>
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Active: 'badge-success',
            Inactive: 'badge-gray',
            Obsolete: 'badge-error',
        };
        return classes[status] || 'badge-gray';
    };

    const getTypeBadge = (type: string) => {
        const classes: Record<string, string> = {
            'Finished Good': 'badge-primary',
            Component: 'badge-info',
            'Raw Material': 'badge-warning',
            Subassembly: 'badge-info',
        };
        return classes[type] || 'badge-gray';
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Item Master</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage items, components, and raw materials
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    New Item
                </button>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Items</div>
                        <div className="kpi-value">{items.length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Finished Goods</div>
                        <div className="kpi-value">
                            {items.filter((i: Item) => i.item_type === 'Finished Good').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon info">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Components</div>
                        <div className="kpi-value">
                            {items.filter((i: Item) => i.item_type === 'Component').length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Raw Materials</div>
                        <div className="kpi-value">
                            {items.filter((i: Item) => i.item_type === 'Raw Material').length}
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
                                placeholder="Search items..."
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-input form-select"
                            style={{ width: '200px' }}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Finished Good">Finished Good</option>
                            <option value="Component">Component</option>
                            <option value="Raw Material">Raw Material</option>
                            <option value="Subassembly">Subassembly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Package size={20} style={{ marginRight: '0.5rem' }} />
                        Items ({filteredItems.length})
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
                                <th>Item Code</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>UoM</th>
                                <th>Device Class</th>
                                <th>Rev</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item: Item) => (
                                <tr key={item.id}>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                            {item.item_code}
                                        </span>
                                    </td>
                                    <td>{item.description}</td>
                                    <td>
                                        {item.item_type && (
                                            <span className={`badge ${getTypeBadge(item.item_type)}`}>
                                                {item.item_type}
                                            </span>
                                        )}
                                    </td>
                                    <td>{item.unit_of_measure}</td>
                                    <td>{item.device_class || '-'}</td>
                                    <td>
                                        <span className="badge badge-gray">{item.item_revision}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(item)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleEdit(item)}
                                                title="Edit Item"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleDelete(item)}
                                                title="Delete Item"
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
                title="Create New Item"
                size="lg"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Item Code *</label>
                                <input
                                    type="text"
                                    name="item_code"
                                    className="form-input"
                                    placeholder="MD-XXXX"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Item Type *</label>
                                <select name="item_type" className="form-input form-select" required>
                                    <option value="">Select type...</option>
                                    <option value="Finished Good">Finished Good</option>
                                    <option value="Component">Component</option>
                                    <option value="Raw Material">Raw Material</option>
                                    <option value="Subassembly">Subassembly</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <input
                                type="text"
                                name="description"
                                className="form-input"
                                placeholder="Item description"
                                required
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Unit of Measure *</label>
                                <select name="unit_of_measure" className="form-input form-select" required>
                                    <option value="EA">Each (EA)</option>
                                    <option value="KG">Kilogram (KG)</option>
                                    <option value="M">Meter (M)</option>
                                    <option value="L">Liter (L)</option>
                                    <option value="BOX">Box</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Device Class</label>
                                <select name="device_class" className="form-input form-select">
                                    <option value="">N/A</option>
                                    <option value="Class I">Class I</option>
                                    <option value="Class II">Class II</option>
                                    <option value="Class III">Class III</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">UDI (Unique Device Identifier)</label>
                            <input type="text" name="udi" className="form-input" placeholder="UDI code" />
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
                            {createMutation.isPending ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            {selectedItem && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                    }}
                    title="Edit Item"
                    size="lg"
                >
                    <form onSubmit={handleEditSubmit}>
                        <div className="modal-body">
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Item Code *</label>
                                    <input
                                        type="text"
                                        name="item_code"
                                        className="form-input"
                                        defaultValue={selectedItem.item_code}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Item Type *</label>
                                    <select
                                        name="item_type"
                                        className="form-input form-select"
                                        defaultValue={selectedItem.item_type}
                                        required
                                    >
                                        <option value="">Select type...</option>
                                        <option value="Finished Good">Finished Good</option>
                                        <option value="Component">Component</option>
                                        <option value="Raw Material">Raw Material</option>
                                        <option value="Subassembly">Subassembly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    defaultValue={selectedItem.description}
                                    required
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Unit of Measure *</label>
                                    <select
                                        name="unit_of_measure"
                                        className="form-input form-select"
                                        defaultValue={selectedItem.unit_of_measure}
                                        required
                                    >
                                        <option value="EA">Each (EA)</option>
                                        <option value="KG">Kilogram (KG)</option>
                                        <option value="M">Meter (M)</option>
                                        <option value="L">Liter (L)</option>
                                        <option value="BOX">Box</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Device Class</label>
                                    <select
                                        name="device_class"
                                        className="form-input form-select"
                                        defaultValue={selectedItem.device_class || ''}
                                    >
                                        <option value="">N/A</option>
                                        <option value="Class I">Class I</option>
                                        <option value="Class II">Class II</option>
                                        <option value="Class III">Class III</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Revision</label>
                                    <input
                                        type="text"
                                        name="item_revision"
                                        className="form-input"
                                        defaultValue={selectedItem.item_revision}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        className="form-input form-select"
                                        defaultValue={selectedItem.status}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Obsolete">Obsolete</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">UDI (Unique Device Identifier)</label>
                                <input
                                    type="text"
                                    name="udi"
                                    className="form-input"
                                    defaultValue={selectedItem.udi || ''}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedItem(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Updating...' : 'Update Item'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Modal */}
            {selectedItem && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedItem(null);
                    }}
                    title="Item Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Item Code
                                </label>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                                    {selectedItem.item_code}
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Item Type
                                </label>
                                <p>
                                    {selectedItem.item_type && (
                                        <span className={`badge ${getTypeBadge(selectedItem.item_type)}`}>
                                            {selectedItem.item_type}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Description
                                </label>
                                <p>{selectedItem.description}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Unit of Measure
                                </label>
                                <p>{selectedItem.unit_of_measure}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Device Class
                                </label>
                                <p>{selectedItem.device_class || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Revision
                                </label>
                                <p>
                                    <span className="badge badge-gray">{selectedItem.item_revision}</span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedItem.status)}`}>
                                        {selectedItem.status}
                                    </span>
                                </p>
                            </div>
                            {selectedItem.udi && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        UDI
                                    </label>
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                        {selectedItem.udi}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Created At
                                </label>
                                <p>{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedItem(null);
                            }}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowViewModal(false);
                                handleEdit(selectedItem);
                            }}
                        >
                            <Edit size={16} />
                            Edit Item
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedItem(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Item"
                message={`Are you sure you want to delete "${selectedItem?.item_code}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default Items;
