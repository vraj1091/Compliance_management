import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Users, BookOpen, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';
import { trainingApi, hrApi } from '../api';
import Modal from '../components/Modal';

interface TrainingRecord {
    id: string;
    employee_id: string;
    training_subject: string;
    training_date: string;
    venue?: string;
    faculty_name?: string;
    duration_hours?: number;
    status: string;
    created_at: string;
}

const Training: React.FC = () => {
    const queryClient = useQueryClient();
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showMatrixModal, setShowMatrixModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);

    // Fetch training records
    const { data: trainingRecords = [], isLoading } = useQuery({
        queryKey: ['training-records'],
        queryFn: trainingApi.getRecords,
    });

    // Fetch employees for dropdown
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: hrApi.getEmployees,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: trainingApi.createRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-records'] });
            setShowRecordModal(false);
        },
    });

    const handleRecordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            employee_id: formData.get('employee_id'),
            training_subject: formData.get('training_subject'),
            training_date: formData.get('training_date'),
            venue: formData.get('venue') || null,
            faculty_name: formData.get('faculty_name') || null,
            duration_hours: formData.get('duration_hours') ? Number(formData.get('duration_hours')) : null,
            status: 'Completed',
        };
        createMutation.mutate(data);
    };

    const handleView = (record: TrainingRecord) => {
        setSelectedRecord(record);
        setShowViewModal(true);
    };

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Current: 'badge-success',
            'Expiring Soon': 'badge-warning',
            Expired: 'badge-error',
            Completed: 'badge-success',
            Scheduled: 'badge-info',
        };
        return classes[status] || 'badge-gray';
    };

    // Calculate statistics
    const currentCount = trainingRecords.filter((r: TrainingRecord) => r.status === 'Current' || r.status === 'Completed').length;
    const expiringSoonCount = trainingRecords.filter((r: TrainingRecord) => r.status === 'Expiring Soon').length;
    const expiredCount = trainingRecords.filter((r: TrainingRecord) => r.status === 'Expired').length;

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Training Management</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage training requirements and records
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setShowMatrixModal(true)}>
                        <BookOpen size={18} />
                        Training Matrix
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowRecordModal(true)}>
                        <GraduationCap size={18} />
                        Record Training
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Current</div>
                        <div className="kpi-value">{currentCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Expiring Soon</div>
                        <div className="kpi-value">{expiringSoonCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <AlertCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Expired</div>
                        <div className="kpi-value">{expiredCount}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Employees</div>
                        <div className="kpi-value">{employees.length}</div>
                    </div>
                </div>
            </div>

            {/* Training Records */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <GraduationCap size={20} style={{ marginRight: '0.5rem' }} />
                        Training Records ({trainingRecords.length})
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
                                <th>Employee</th>
                                <th>Training Subject</th>
                                <th>Date</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainingRecords.map((record: TrainingRecord) => (
                                <tr key={record.id}>
                                    <td style={{ fontWeight: 500 }}>{record.employee_id}</td>
                                    <td>{record.training_subject}</td>
                                    <td className="text-sm">
                                        {new Date(record.training_date).toLocaleDateString()}
                                    </td>
                                    <td className="text-sm">
                                        {record.duration_hours ? `${record.duration_hours}h` : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm btn-icon"
                                            onClick={() => handleView(record)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Record Training Modal */}
            <Modal
                isOpen={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                title="Record Training"
                size="lg"
            >
                <form onSubmit={handleRecordSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Employee *</label>
                            <select name="employee_id" className="form-input form-select" required>
                                <option value="">Select employee...</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} - {emp.employee_code}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Training Subject *</label>
                            <input
                                type="text"
                                name="training_subject"
                                className="form-input"
                                placeholder="e.g., GMP Training, Equipment Operation"
                                required
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Training Date *</label>
                                <input type="date" name="training_date" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (hours)</label>
                                <input
                                    type="number"
                                    name="duration_hours"
                                    className="form-input"
                                    placeholder="4"
                                    step="0.5"
                                />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Venue</label>
                                <input
                                    type="text"
                                    name="venue"
                                    className="form-input"
                                    placeholder="Conference Room A"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Faculty Name</label>
                                <input
                                    type="text"
                                    name="faculty_name"
                                    className="form-input"
                                    placeholder="Trainer name"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowRecordModal(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Recording...' : 'Record Training'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Training Matrix Modal */}
            <Modal
                isOpen={showMatrixModal}
                onClose={() => setShowMatrixModal(false)}
                title="Training Matrix"
                size="xl"
            >
                <div className="modal-body">
                    <p className="text-muted mb-4">
                        Training matrix shows required training for each role and frequency.
                    </p>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Training</th>
                                <th>Code</th>
                                <th>Role</th>
                                <th>Frequency</th>
                                <th>Required</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 500 }}>GMP Training</td>
                                <td className="text-sm">GMP-101</td>
                                <td className="text-sm">QA Engineer</td>
                                <td className="text-sm">12 months</td>
                                <td>
                                    <span className="badge badge-success">Yes</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 500 }}>Equipment Operation</td>
                                <td className="text-sm">EQ-201</td>
                                <td className="text-sm">Operator</td>
                                <td className="text-sm">24 months</td>
                                <td>
                                    <span className="badge badge-success">Yes</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 500 }}>Document Control</td>
                                <td className="text-sm">DOC-101</td>
                                <td className="text-sm">All</td>
                                <td className="text-sm">12 months</td>
                                <td>
                                    <span className="badge badge-success">Yes</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 500 }}>CAPA Process</td>
                                <td className="text-sm">CAPA-101</td>
                                <td className="text-sm">QA Staff</td>
                                <td className="text-sm">12 months</td>
                                <td>
                                    <span className="badge badge-success">Yes</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowMatrixModal(false)}>
                        Close
                    </button>
                </div>
            </Modal>

            {/* View Modal */}
            {selectedRecord && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedRecord(null);
                    }}
                    title="Training Record Details"
                    size="lg"
                >
                    <div className="modal-body">
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Employee
                                </label>
                                <p style={{ fontWeight: 500 }}>{selectedRecord.employee_id}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span className={`badge ${getStatusBadge(selectedRecord.status)}`}>
                                        {selectedRecord.status}
                                    </span>
                                </p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Training Subject
                                </label>
                                <p>{selectedRecord.training_subject}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Training Date
                                </label>
                                <p>{new Date(selectedRecord.training_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Duration
                                </label>
                                <p>{selectedRecord.duration_hours ? `${selectedRecord.duration_hours} hours` : 'N/A'}</p>
                            </div>
                            {selectedRecord.venue && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Venue
                                    </label>
                                    <p>{selectedRecord.venue}</p>
                                </div>
                            )}
                            {selectedRecord.faculty_name && (
                                <div>
                                    <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Faculty
                                    </label>
                                    <p>{selectedRecord.faculty_name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedRecord(null);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Training;
