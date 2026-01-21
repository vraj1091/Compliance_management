import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Search, Upload, Download, Trash2, CheckCircle } from 'lucide-react';
import { documentsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Document {
    id: string;
    doc_number: string;
    title: string;
    description?: string;
    document_type: string;
    status: string;
    current_revision: number;
    created_by: string;
    created_at: string;
}

const Documents: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch documents
    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents', statusFilter],
        queryFn: () => documentsApi.getAll({ status: statusFilter || undefined }),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: documentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setShowCreateModal(false);
        },
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => documentsApi.uploadFile(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedDoc(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: documentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setSelectedDoc(null);
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: documentsApi.approve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            document_type: formData.get('document_type'),
            description: formData.get('description') || null,
        };
        createMutation.mutate(data);
    };

    const handleUploadFile = () => {
        if (!selectedDoc || !selectedFile) return;
        uploadMutation.mutate({ id: selectedDoc.id, file: selectedFile });
    };

    const handleDownload = async (doc: Document) => {
        try {
            const blob = await documentsApi.downloadFile(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc.doc_number}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download:', error);
            alert('No file available for download');
        }
    };

    const handleApprove = (doc: Document) => {
        approveMutation.mutate(doc.id);
    };

    const handleDelete = (doc: Document) => {
        setSelectedDoc(doc);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedDoc) {
            deleteMutation.mutate(selectedDoc.id);
        }
    };

    const openUploadModal = (doc: Document) => {
        setSelectedDoc(doc);
        setShowUploadModal(true);
    };

    const filteredDocuments = documents.filter(
        (doc: Document) =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.doc_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            Approved: 'badge-success',
            Draft: 'badge-gray',
            'Under Review': 'badge-warning',
            Obsolete: 'badge-error',
        };
        return classes[status] || 'badge-info';
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>Document Control</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage controlled documents and procedures
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    New Document
                </button>
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
                                placeholder="Search documents..."
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
                            <option value="Draft">Draft</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Obsolete">Obsolete</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <FileText size={20} style={{ marginRight: '0.5rem' }} />
                        Documents ({filteredDocuments.length})
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
                                <th>Document #</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Revision</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map((doc: Document) => (
                                <tr key={doc.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                                            {doc.doc_number}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{doc.title}</div>
                                            {doc.description && (
                                                <div className="text-muted text-sm">{doc.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>{doc.document_type}</td>
                                    <td>
                                        <span className="badge badge-primary">Rev {doc.current_revision}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="text-sm">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                title="Upload File"
                                                onClick={() => openUploadModal(doc)}
                                            >
                                                <Upload size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                title="Download"
                                                onClick={() => handleDownload(doc)}
                                            >
                                                <Download size={16} />
                                            </button>
                                            {doc.status === 'Draft' && (
                                                <button
                                                    className="btn btn-success btn-sm btn-icon"
                                                    title="Approve"
                                                    onClick={() => handleApprove(doc)}
                                                    disabled={approveMutation.isPending}
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                title="Delete"
                                                onClick={() => handleDelete(doc)}
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
                title="Create New Document"
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
                                placeholder="Document title"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Document Type *</label>
                            <select name="document_type" className="form-input form-select" required>
                                <option value="">Select type...</option>
                                <option value="Manual">Manual</option>
                                <option value="Procedure">Procedure</option>
                                <option value="Work Instruction">Work Instruction</option>
                                <option value="Form">Form</option>
                                <option value="Policy">Policy</option>
                                <option value="SOP">SOP</option>
                                <option value="Specification">Specification</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows={3}
                                placeholder="Brief description..."
                            ></textarea>
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
                            {createMutation.isPending ? 'Creating...' : 'Create Document'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Upload Modal */}
            {selectedDoc && (
                <Modal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        setSelectedFile(null);
                        setSelectedDoc(null);
                    }}
                    title={`Upload File - ${selectedDoc.doc_number}`}
                    size="md"
                >
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Select File</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="form-input"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-muted">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowUploadModal(false);
                                setSelectedFile(null);
                                setSelectedDoc(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleUploadFile}
                            disabled={uploadMutation.isPending || !selectedFile}
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedDoc(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Document"
                message={`Are you sure you want to delete document "${selectedDoc?.doc_number}"? This action cannot be undone.`}
                confirmText="Delete"
                isDestructive
            />
        </div>
    );
};

export default Documents;
