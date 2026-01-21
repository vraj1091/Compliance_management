import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TestTube, ClipboardCheck, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { qcApi, workOrdersApi } from '../api';
import Modal from '../components/Modal';

const QualityControl: React.FC = () => {
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const queryClient = useQueryClient();

    // Fetch data
    const { data: inspectionPlans = [], isLoading: loadingPlans } = useQuery({
        queryKey: ['inspection-plans'],
        queryFn: qcApi.getInspectionPlans,
    });

    const { data: inspections = [], isLoading: loadingInspections } = useQuery({
        queryKey: ['inspections'],
        queryFn: qcApi.getInspections,
    });

    const { data: workOrders = [] } = useQuery({
        queryKey: ['work-orders'],
        queryFn: workOrdersApi.getAll,
    });

    // Create inspection mutation
    const createInspectionMutation = useMutation({
        mutationFn: qcApi.createInspection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
            setShowInspectionModal(false);
        },
    });

    const handleInspectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        createInspectionMutation.mutate({
            work_order_id: formData.get('work_order_id'),
            inspection_plan_id: formData.get('inspection_plan_id'),
            lot_number: formData.get('lot_number') || null,
            sample_size: formData.get('sample_size') ? parseInt(formData.get('sample_size') as string) : null,
        });
    };

    const getResultBadge = (status: string) => {
        switch (status) {
            case 'Pass':
            case 'Completed':
                return 'badge-success';
            case 'Fail':
                return 'badge-error';
            case 'Pending':
            case 'In Progress':
                return 'badge-warning';
            default:
                return 'badge-gray';
        }
    };

    const pendingCount = inspections.filter((i: any) => i.status === 'In Progress' || i.status === 'Pending').length;
    const passedCount = inspections.filter((i: any) => i.status === 'Pass' || i.disposition === 'Accept').length;
    const failedCount = inspections.filter((i: any) => i.status === 'Fail' || i.disposition === 'Reject').length;
    const activePlansCount = inspectionPlans.filter((p: any) => p.status === 'Active').length;

    if (loadingPlans || loadingInspections) {
        return <div className="loading-overlay"><div className="spinner-lg"></div></div>;
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Quality Control</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage inspections and quality testing
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary" onClick={() => setShowInspectionModal(true)}>
                        <TestTube size={18} />
                        New Inspection
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Pending</div>
                        <div className="kpi-value">{pendingCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Passed (This Month)</div>
                        <div className="kpi-value">{passedCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <XCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Failed (This Month)</div>
                        <div className="kpi-value">{failedCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <ClipboardCheck size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Plans</div>
                        <div className="kpi-value">{activePlansCount}</div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Inspection Plans */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <ClipboardCheck size={20} style={{ marginRight: '0.5rem' }} />
                            Inspection Plans
                        </h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Plan Name</th>
                                <th>Type</th>
                                <th>Sampling</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspectionPlans.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted">
                                        No inspection plans found
                                    </td>
                                </tr>
                            ) : (
                                inspectionPlans.map((plan: any) => (
                                    <tr key={plan.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                            {plan.item_id}
                                        </td>
                                        <td className="text-sm">{plan.plan_name}</td>
                                        <td>
                                            <span className="badge badge-info">{plan.inspection_type}</span>
                                        </td>
                                        <td className="text-sm">{plan.sampling_level || 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Recent Inspections */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <TestTube size={20} style={{ marginRight: '0.5rem' }} />
                            Recent Inspections
                        </h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Work Order</th>
                                <th>Lot</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspections.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted">
                                        No inspections found
                                    </td>
                                </tr>
                            ) : (
                                inspections.map((insp: any) => (
                                    <tr key={insp.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                            {insp.work_order_id}
                                        </td>
                                        <td className="text-sm">{insp.lot_number || '-'}</td>
                                        <td className="text-sm">
                                            {insp.inspection_date ? new Date(insp.inspection_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${getResultBadge(insp.status)}`}>
                                                {insp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Inspection Modal */}
            <Modal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                title="Create New Inspection"
                size="md"
            >
                <form onSubmit={handleInspectionSubmit}>
                    <div className="form-group">
                        <label className="form-label">Work Order *</label>
                        <select name="work_order_id" className="form-input form-select" required>
                            <option value="">Select Work Order</option>
                            {workOrders.map((wo: any) => (
                                <option key={wo.id} value={wo.id}>
                                    {wo.work_order_number} - {wo.item_id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Inspection Plan *</label>
                        <select name="inspection_plan_id" className="form-input form-select" required>
                            <option value="">Select Inspection Plan</option>
                            {inspectionPlans.map((plan: any) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.plan_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Lot Number</label>
                        <input
                            type="text"
                            name="lot_number"
                            className="form-input"
                            placeholder="Enter lot number"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sample Size</label>
                        <input
                            type="number"
                            name="sample_size"
                            className="form-input"
                            placeholder="Enter sample size"
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowInspectionModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createInspectionMutation.isPending}
                        >
                            {createInspectionMutation.isPending ? 'Creating...' : 'Create Inspection'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default QualityControl;
