import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users as UsersIcon, Shield, Edit, Trash2, Eye } from 'lucide-react';
import { usersApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    department: string;
    is_active: boolean;
    role?: { id: string; name: string };
    created_at: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
}

const Users: React.FC = () => {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Fetch users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    // Fetch roles
    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: usersApi.getRoles,
    });

    // Create user mutation
    const createMutation = useMutation({
        mutationFn: usersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowCreateModal(false);
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowEditModal(false);
            setSelectedUser(null);
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersApi.update(id, { is_active: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setSelectedUser(null);
        },
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            department: formData.get('department'),
            role_id: formData.get('role_id') || null,
        };
        createMutation.mutate(data);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUser) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            department: formData.get('department'),
            role_id: formData.get('role_id') || null,
            is_active: formData.get('is_active') === 'true',
        };
        updateMutation.mutate({ id: selectedUser.id, data });
    };

    const handleView = (user: User) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
        }
    };

    const activeUsers = users.filter((u: User) => u.is_active);
    const inactiveUsers = users.filter((u: User) => !u.is_active);

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2>User Management</h2>
                    <p className="text-muted text-sm mt-1">
                        Manage users, roles, and permissions
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {/* Summary Cards */}
            <div className="kpi-grid mb-6">
                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <UsersIcon size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Users</div>
                        <div className="kpi-value">{users.length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <UsersIcon size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active</div>
                        <div className="kpi-value">{activeUsers.length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <UsersIcon size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Inactive</div>
                        <div className="kpi-value">{inactiveUsers.length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon info">
                        <Shield size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Roles</div>
                        <div className="kpi-value">{roles.length}</div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <UsersIcon size={20} style={{ marginRight: '0.5rem' }} />
                        Users ({users.length})
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
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: User) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="user-avatar"
                                                style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                                            >
                                                {user.first_name?.[0]}
                                                {user.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-muted text-xs">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm">{user.email}</td>
                                    <td>
                                        <span className="badge badge-primary">
                                            {user.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="text-sm">{user.department || '-'}</td>
                                    <td>
                                        <span
                                            className={`badge ${user.is_active ? 'badge-success' : 'badge-gray'}`}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleView(user)}
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm btn-icon"
                                                onClick={() => handleEdit(user)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {user.is_active && (
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    onClick={() => handleDelete(user)}
                                                    title="Deactivate"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Roles Section */}
            <div className="card mt-6">
                <div className="card-header">
                    <h3 className="card-title">
                        <Shield size={20} style={{ marginRight: '0.5rem' }} />
                        Roles
                    </h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Description</th>
                            <th>Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role: Role) => (
                            <tr key={role.id}>
                                <td style={{ fontWeight: 500 }}>{role.name}</td>
                                <td className="text-sm">{role.description || '-'}</td>
                                <td>
                                    <span className="badge badge-gray">
                                        {users.filter((u: User) => u.role?.id === role.id).length} users
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New User"
                size="lg"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <select name="department" className="form-input form-select">
                                    <option value="">Select department...</option>
                                    <option value="IT">IT</option>
                                    <option value="Quality Assurance">Quality Assurance</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select name="role_id" className="form-input form-select">
                                    <option value="">Select role...</option>
                                    {roles.map((role: Role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                            {createMutation.isPending ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            {selectedUser && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    title="Edit User"
                    size="lg"
                >
                    <form onSubmit={handleEditSubmit}>
                        <div className="modal-body">
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-input"
                                        defaultValue={selectedUser.first_name}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-input"
                                        defaultValue={selectedUser.last_name}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select
                                        name="department"
                                        className="form-input form-select"
                                        defaultValue={selectedUser.department || ''}
                                    >
                                        <option value="">Select department...</option>
                                        <option value="IT">IT</option>
                                        <option value="Quality Assurance">Quality Assurance</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        name="role_id"
                                        className="form-input form-select"
                                        defaultValue={selectedUser.role?.id || ''}
                                    >
                                        <option value="">Select role...</option>
                                        {roles.map((role: Role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="is_active"
                                    className="form-input form-select"
                                    defaultValue={selectedUser.is_active ? 'true' : 'false'}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedUser(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View User Modal */}
            {selectedUser && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedUser(null);
                    }}
                    title="User Details"
                    size="md"
                >
                    <div className="modal-body">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div
                                className="user-avatar"
                                style={{
                                    width: 64,
                                    height: 64,
                                    fontSize: '1.25rem',
                                    margin: '0 auto 0.75rem',
                                }}
                            >
                                {selectedUser.first_name?.[0]}
                                {selectedUser.last_name?.[0]}
                            </div>
                            <h3 style={{ margin: 0 }}>
                                {selectedUser.first_name} {selectedUser.last_name}
                            </h3>
                            <p className="text-muted">@{selectedUser.username}</p>
                        </div>
                        <div className="grid-2" style={{ gap: '1rem' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Email
                                </label>
                                <p>{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Role
                                </label>
                                <p>
                                    <span className="badge badge-primary">
                                        {selectedUser.role?.name || 'No Role'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Department
                                </label>
                                <p>{selectedUser.department || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                                    Status
                                </label>
                                <p>
                                    <span
                                        className={`badge ${selectedUser.is_active ? 'badge-success' : 'badge-gray'}`}
                                    >
                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedUser(null);
                            }}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowViewModal(false);
                                setShowEditModal(true);
                            }}
                        >
                            <Edit size={16} />
                            Edit
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedUser(null);
                }}
                onConfirm={confirmDelete}
                title="Deactivate User"
                message={`Are you sure you want to deactivate user "${selectedUser?.first_name} ${selectedUser?.last_name}"? They will no longer be able to log in.`}
                confirmText="Deactivate"
                isDestructive
            />
        </div>
    );
};

export default Users;
