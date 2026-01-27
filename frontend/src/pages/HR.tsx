import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api';
import { Users, GraduationCap, Award, Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  department: string;
  designation: string;
  email: string;
  mobile: string;
  status: string;
  date_of_joining: string;
}

interface TrainingSession {
  id: string;
  training_no: string;
  subject: string;
  training_date: string;
  venue: string;
  faculty_name: string;
  status: string;
}

const HR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'training' | 'competency'>('employees');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await hrApi.getEmployees();
      return res;
    },
  });

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: async () => {
      const res = await hrApi.getTrainingSessions();
      return res;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['hr-stats'],
    queryFn: async () => {
      const res = await hrApi.getStats();
      return res;
    },
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: hrApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr-stats'] });
      setShowEmployeeModal(false);
    },
  });

  // Create training session mutation
  const createTrainingMutation = useMutation({
    mutationFn: hrApi.createTrainingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['hr-stats'] });
      setShowTrainingModal(false);
    },
  });

  const handleEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createEmployeeMutation.mutate({
      employee_code: formData.get('employee_code'),
      full_name: formData.get('full_name'),
      department: formData.get('department'),
      designation: formData.get('designation'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      date_of_joining: formData.get('date_of_joining'),
    });
  };

  const handleTrainingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createTrainingMutation.mutate({
      subject: formData.get('subject'),
      training_date: formData.get('training_date'),
      venue: formData.get('venue'),
      faculty_name: formData.get('faculty_name'),
      duration_hours: parseFloat(formData.get('duration_hours') as string),
    });
  };

  const filteredEmployees = employees.filter((emp: Employee) =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>HR Department</h1>
          <p>Manage employees, training, and competency</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowEmployeeModal(true)}>
          <Plus size={20} /> Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <Users size={24} color="#1976d2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total_employees || 0}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <Users size={24} color="#388e3c" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.active_employees || 0}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <GraduationCap size={24} color="#f57c00" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.scheduled_trainings || 0}</div>
            <div className="stat-label">Scheduled Trainings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <Award size={24} color="#7b1fa2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.completed_trainings || 0}</div>
            <div className="stat-label">Completed Trainings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}>
          <Users size={18} /> Employees
        </button>
        <button className={`tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}>
          <GraduationCap size={18} /> Training Sessions
        </button>
        <button className={`tab ${activeTab === 'competency' ? 'active' : ''}`}
          onClick={() => setActiveTab('competency')}>
          <Award size={18} /> Competency Matrix
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search employees..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Content */}
      {activeTab === 'employees' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingEmployees ? (
                <tr><td colSpan={6}>Loading...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={6}>No employees found</td></tr>
              ) : (
                filteredEmployees.map((emp: Employee) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_code}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.email}</td>
                    <td><span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {emp.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'training' && (
        <div>
          <div className="mb-4">
            <button className="btn btn-primary" onClick={() => setShowTrainingModal(true)}>
              <Plus size={18} /> Schedule Training
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Training No</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Faculty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trainingSessions.length === 0 ? (
                  <tr><td colSpan={6}>No training sessions found</td></tr>
                ) : (
                  trainingSessions.map((session: TrainingSession) => (
                    <tr key={session.id}>
                      <td>{session.training_no}</td>
                      <td>{session.subject}</td>
                      <td>{session.training_date}</td>
                      <td>{session.venue}</td>
                      <td>{session.faculty_name}</td>
                      <td><span className={`badge ${session.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                        {session.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'competency' && (
        <div className="card">
          <p>Competency Matrix - View and manage employee competencies</p>
        </div>
      )}

      {/* Employee Modal */}
      <Modal isOpen={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} title="Add New Employee" size="md">
        <form onSubmit={handleEmployeeSubmit}>
          <div className="form-group">
            <label className="form-label">Employee Code *</label>
            <input type="text" name="employee_code" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" name="full_name" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <input type="text" name="department" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Designation *</label>
            <input type="text" name="designation" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" name="email" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input type="tel" name="mobile" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Joining</label>
            <input type="date" name="date_of_joining" className="form-input" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createEmployeeMutation.isPending}>
              {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Training Modal */}
      <Modal isOpen={showTrainingModal} onClose={() => setShowTrainingModal(false)} title="Schedule Training" size="md">
        <form onSubmit={handleTrainingSubmit}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input type="text" name="subject" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Training Date *</label>
            <input type="date" name="training_date" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <input type="text" name="venue" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Faculty Name *</label>
            <input type="text" name="faculty_name" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Duration (hours)</label>
            <input type="number" name="duration_hours" className="form-input" step="0.5" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTrainingModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createTrainingMutation.isPending}>
              {createTrainingMutation.isPending ? 'Scheduling...' : 'Schedule Training'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HR;
