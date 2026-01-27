import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Warehouse, Package, Layers, AlertTriangle, Plus } from 'lucide-react';
import { inventoryApi } from '../api';
import Modal from '../components/Modal';

const Inventory: React.FC = () => {
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showLotModal, setShowLotModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<any>(null);
    const queryClient = useQueryClient();

    // Fetch inventory data
    const { data: inventoryItems = [], isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => inventoryApi.getAll(),
    });

    const { data: lots = [] } = useQuery({
        queryKey: ['lots'],
        queryFn: () => inventoryApi.getLots(),
    });

    const { data: summary } = useQuery({
        queryKey: ['inventory-summary'],
        queryFn: () => inventoryApi.getSummary(),
    });

    // Adjust inventory mutation
    const adjustMutation = useMutation({
        mutationFn: ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) =>
            inventoryApi.adjust(id, quantity, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
            setShowAdjustModal(false);
            setSelectedInventory(null);
        },
    });

    // Create lot mutation
    const createLotMutation = useMutation({
        mutationFn: inventoryApi.createLot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lots'] });
            setShowLotModal(false);
        },
    });

    const handleAdjustClick = (item: any) => {
        setSelectedInventory(item);
        setShowAdjustModal(true);
    };

    const handleAdjustSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const quantity = parseFloat(formData.get('quantity') as string);
        const reason = formData.get('reason') as string;

        if (selectedInventory) {
            adjustMutation.mutate({
                id: selectedInventory.id,
                quantity,
                reason,
            });
        }
    };

    const handleLotSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        createLotMutation.mutate({
            item_id: formData.get('item_id'),
            lot_number: formData.get('lot_number'),
            manufacturing_date: formData.get('manufacturing_date'),
            expiry_date: formData.get('expiry_date') || null,
            quantity_manufactured: parseFloat(formData.get('quantity_manufactured') as string),
            warehouse_location: formData.get('warehouse_location'),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return 'badge-success';
            case 'In Progress':
                return 'badge-warning';
            case 'Expiring':
                return 'badge-error';
            case 'On Hold':
                return 'badge-gray';
            default:
                return 'badge-info';
        }
    };

    if (isLoading) {
        return <div className="loading-overlay"><div className="spinner-lg"></div></div>;
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Inventory Management</h2>
                    <p className="text-muted text-sm mt-1">
                        Track inventory levels and lot traceability
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setShowLotModal(true)}>
                        <Layers size={18} />
                        Create Lot
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <Warehouse size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total SKUs</div>
                        <div className="kpi-value">{summary?.total_records || 0}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Lots</div>
                        <div className="kpi-value">{summary?.active_lots || 0}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Low Stock Items</div>
                        <div className="kpi-value">{summary?.low_stock_items || 0}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon accent">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total On Hand</div>
                        <div className="kpi-value">{Math.round(summary?.total_quantity_on_hand || 0)}</div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="card-title">
                        <Warehouse size={20} style={{ marginRight: '0.5rem' }} />
                        Inventory Levels
                    </h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Location</th>
                            <th>On Hand</th>
                            <th>Reserved</th>
                            <th>Available</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    No inventory records found
                                </td>
                            </tr>
                        ) : (
                            inventoryItems.map((item: any) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                        {item.item_id}
                                    </td>
                                    <td className="text-sm">
                                        {item.warehouse_location}
                                        {item.bin_location && (
                                            <div className="text-muted text-xs">Bin: {item.bin_location}</div>
                                        )}
                                    </td>
                                    <td>{Math.round(item.quantity_on_hand)}</td>
                                    <td>{Math.round(item.quantity_reserved)}</td>
                                    <td style={{ fontWeight: 500 }}>{Math.round(item.quantity_available)}</td>
                                    <td>
                                        <span className={`badge ${item.quantity_available < 50 ? 'badge-warning' : 'badge-success'}`}>
                                            {item.quantity_available < 50 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleAdjustClick(item)}
                                        >
                                            Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Lots Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Layers size={20} style={{ marginRight: '0.5rem' }} />
                        Lot Tracking
                    </h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Lot #</th>
                            <th>Item</th>
                            <th>Manufactured</th>
                            <th>Expiry</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lots.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">
                                    No lot records found
                                </td>
                            </tr>
                        ) : (
                            lots.map((lot: any) => (
                                <tr key={lot.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                        {lot.lot_number}
                                    </td>
                                    <td>{lot.item_id}</td>
                                    <td className="text-sm">
                                        {lot.manufacturing_date ? new Date(lot.manufacturing_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="text-sm">
                                        {lot.expiry_date ? new Date(lot.expiry_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>{Math.round(lot.quantity_remaining || 0)}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(lot.status)}`}>
                                            {lot.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Adjust Inventory Modal */}
            <Modal
                isOpen={showAdjustModal}
                onClose={() => {
                    setShowAdjustModal(false);
                    setSelectedInventory(null);
                }}
                title="Adjust Inventory"
                size="md"
            >
                <form onSubmit={handleAdjustSubmit}>
                    <div className="form-group">
                        <label className="form-label">Item</label>
                        <input
                            type="text"
                            className="form-input"
                            value={selectedInventory?.item_id || ''}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Current Quantity</label>
                        <input
                            type="text"
                            className="form-input"
                            value={Math.round(selectedInventory?.quantity_on_hand || 0)}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Adjustment Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            className="form-input"
                            placeholder="Enter positive or negative number"
                            step="0.01"
                            required
                        />
                        <small className="text-muted">Use negative numbers to decrease inventory</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reason *</label>
                        <textarea
                            name="reason"
                            className="form-input"
                            rows={3}
                            placeholder="Enter reason for adjustment"
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAdjustModal(false);
                                setSelectedInventory(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={adjustMutation.isPending}
                        >
                            {adjustMutation.isPending ? 'Adjusting...' : 'Adjust Inventory'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Lot Modal */}
            <Modal
                isOpen={showLotModal}
                onClose={() => setShowLotModal(false)}
                title="Create New Lot"
                size="md"
            >
                <form onSubmit={handleLotSubmit}>
                    <div className="form-group">
                        <label className="form-label">Item ID *</label>
                        <input
                            type="text"
                            name="item_id"
                            className="form-input"
                            placeholder="Enter item ID"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Lot Number *</label>
                        <input
                            type="text"
                            name="lot_number"
                            className="form-input"
                            placeholder="Enter lot number"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Manufacturing Date</label>
                        <input
                            type="date"
                            name="manufacturing_date"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                            type="date"
                            name="expiry_date"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Quantity Manufactured *</label>
                        <input
                            type="number"
                            name="quantity_manufactured"
                            className="form-input"
                            placeholder="Enter quantity"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Warehouse Location</label>
                        <input
                            type="text"
                            name="warehouse_location"
                            className="form-input"
                            placeholder="e.g., WH-A"
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowLotModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createLotMutation.isPending}
                        >
                            {createLotMutation.isPending ? 'Creating...' : 'Create Lot'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
