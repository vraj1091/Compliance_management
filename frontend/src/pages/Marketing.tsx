import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Users, FileText, ShoppingCart, MessageSquare, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Customer { 
  id: string; 
  customer_code: string; 
  customer_name: string; 
  customer_type: string; 
  city: string; 
  contact_person: string; 
  status: string; 
}

interface Order { 
  id: string; 
  oc_number: string; 
  oc_date: string; 
  product_generic_name: string; 
  total_amount: number; 
  status: string; 
}

interface Complaint { 
  id: string; 
  complaint_no: string; 
  customer_name: string; 
  complaint_details: string; 
  receipt_date: string; 
  status: string; 
  severity: string; 
}

const Marketing: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'customers' | 'inquiries' | 'orders' | 'complaints'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: async () => { 
      const res = await api.get('/api/marketing/customers'); 
      return res.data; 
    } 
  });

  const { data: orders = [] } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: async () => { 
      const res = await api.get('/api/marketing/orders'); 
      return res.data; 
    } 
  });

  const { data: complaints = [] } = useQuery({ 
    queryKey: ['complaints'], 
    queryFn: async () => { 
      const res = await api.get('/api/marketing/complaints'); 
      return res.data; 
    } 
  });

  const { data: stats } = useQuery({ 
    queryKey: ['marketing-stats'], 
    queryFn: async () => { 
      const res = await api.get('/api/marketing/stats'); 
      return res.data; 
    } 
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/marketing/customers', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      setShowCreateModal(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/marketing/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      setShowDeleteDialog(false);
      setSelectedItem(null);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      customer_name: formData.get('customer_name'),
      customer_type: formData.get('customer_type'),
      city: formData.get('city'),
      contact_person: formData.get('contact_person'),
      contact_phone: formData.get('contact_phone'),
      email: formData.get('email'),
      status: 'Active',
    };
    createMutation.mutate(data);
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

  const filteredCustomers = customers.filter((c: Customer) =>
    c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Marketing Department</h1>
          <p>Customers, orders, and complaints management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <Users size={24} color="#1976d2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total_customers || customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <FileText size={24} color="#388e3c" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.open_inquiries || 0}</div>
            <div className="stat-label">Open Inquiries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <ShoppingCart size={24} color="#f57c00" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pending_orders || orders.length}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}>
            <MessageSquare size={24} color="#d32f2f" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.open_complaints || complaints.length}</div>
            <div className="stat-label">Open Complaints</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`} 
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} /> Customers
        </button>
        <button 
          className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`} 
          onClick={() => setActiveTab('inquiries')}
        >
          <FileText size={18} /> Inquiries
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={18} /> Orders
        </button>
        <button 
          className={`tab ${activeTab === 'complaints' ? 'active' : ''}`} 
          onClick={() => setActiveTab('complaints')}
        >
          <MessageSquare size={18} /> Complaints
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {activeTab === 'customers' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingCustomers ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c: Customer) => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-sm font-medium">{c.customer_code}</span></td>
                    <td><span className="font-medium">{c.customer_name}</span></td>
                    <td>{c.customer_type}</td>
                    <td>{c.city}</td>
                    <td>{c.contact_person}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => handleView(c)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(c)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>OC Number</th>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o: Order) => (
                  <tr key={o.id}>
                    <td><span className="font-mono text-sm font-medium">{o.oc_number}</span></td>
                    <td>{o.oc_date}</td>
                    <td>{o.product_generic_name}</td>
                    <td>₹{o.total_amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${o.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint No</th>
                <th>Customer</th>
                <th>Details</th>
                <th>Date</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((c: Complaint) => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-sm font-medium">{c.complaint_no}</span></td>
                    <td>{c.customer_name}</td>
                    <td>{c.complaint_details?.substring(0, 50)}...</td>
                    <td>{c.receipt_date}</td>
                    <td>
                      <span className={`badge ${c.severity === 'Critical' ? 'badge-danger' : c.severity === 'Major' ? 'badge-warning' : 'badge-info'}`}>
                        {c.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'Closed' ? 'badge-success' : 'badge-error'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={48} />
              </div>
              <div className="empty-state-title">Inquiry Register</div>
              <div className="empty-state-description">
                Inquiry management module coming soon
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Customer"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  className="form-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Type *</label>
                <select name="customer_type" className="form-input" required>
                  <option value="">Select type...</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  name="contact_person"
                  className="form-input"
                  placeholder="Enter contact person"
                  required
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter email"
                />
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
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Customer Modal */}
      {selectedItem && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
          title="Customer Details"
          size="lg"
        >
          <div className="modal-body">
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Customer Code
                </label>
                <p className="font-mono text-sm font-medium">{selectedItem.customer_code}</p>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Status
                </label>
                <p>
                  <span className={`badge ${selectedItem.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedItem.status}
                  </span>
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Customer Name
                </label>
                <p className="font-medium">{selectedItem.customer_name}</p>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Type
                </label>
                <p>{selectedItem.customer_type}</p>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  City
                </label>
                <p>{selectedItem.city}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Contact Person
                </label>
                <p>{selectedItem.contact_person}</p>
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
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${selectedItem?.customer_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
};

export default Marketing;
