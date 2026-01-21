import axios from 'axios';

// Use empty string to leverage Vite's proxy configuration
// In production, this should be set to your actual API URL via environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data || error.message);

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/api/auth/logout');
        return response.data;
    },
};

// Dashboard API
export const dashboardApi = {
    getDashboard: async () => {
        const response = await api.get('/api/dashboard');
        return response.data;
    },
    getKpis: async () => {
        const response = await api.get('/api/dashboard/kpis');
        return response.data;
    },
};

// Documents API
export const documentsApi = {
    getAll: async (params?: { skip?: number; limit?: number; status?: string; document_type?: string; search?: string }) => {
        const response = await api.get('/api/documents', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/documents/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/documents', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/api/documents/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/documents/${id}`);
        return response.data;
    },
    uploadFile: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/api/documents/${id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    downloadFile: async (id: string) => {
        const response = await api.get(`/api/documents/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
    approve: async (id: string) => {
        const response = await api.post(`/api/documents/${id}/approve`);
        return response.data;
    },
    getVersions: async (id: string) => {
        const response = await api.get(`/api/documents/${id}/versions`);
        return response.data;
    },
};

// Nonconformances API
export const ncApi = {
    getAll: async (params?: { skip?: number; limit?: number; status?: string }) => {
        const response = await api.get('/api/nonconformances', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/nonconformances/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/nonconformances', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/api/nonconformances/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/nonconformances/${id}`);
        return response.data;
    },
};

// CAPAs API
export const capaApi = {
    getAll: async (params?: { skip?: number; limit?: number; status?: string }) => {
        const response = await api.get('/api/caparecords', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/caparecords/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/caparecords', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/api/caparecords/${id}`, data);
        return response.data;
    },
};

// Audits API
export const auditsApi = {
    getAll: async (params?: { skip?: number; limit?: number; status?: string }) => {
        const response = await api.get('/api/audits', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/audits/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/audits', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/api/audits/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/audits/${id}`);
        return response.data;
    },
};

// Items API
export const itemsApi = {
    getAll: async (params?: { skip?: number; limit?: number; item_type?: string }) => {
        const response = await api.get('/api/items', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/items/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/items', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/api/items/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/items/${id}`);
        return response.data;
    },
};

// Work Orders API
export const workOrdersApi = {
    getAll: async (params?: { skip?: number; limit?: number; status?: string }) => {
        const response = await api.get('/api/work-orders', { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/work-orders/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/work-orders', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/api/work-orders/${id}`, data);
        return response.data;
    },
    release: async (id: string) => {
        const response = await api.post(`/api/work-orders/${id}/release`);
        return response.data;
    },
    complete: async (id: string, quantity: number) => {
        const response = await api.patch(`/api/work-orders/${id}/complete`, null, {
            params: { quantity_completed: quantity },
        });
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/api/work-orders/${id}`);
        return response.data;
    },
};

// Training API
export const trainingApi = {
    getMatrix: async () => {
        const response = await api.get('/api/training-matrix');
        return response.data;
    },
    getRecords: async () => {
        const response = await api.get('/api/training-records');
        return response.data;
    },
    createRecord: async (data: any) => {
        const response = await api.post('/api/training-records', data);
        return response.data;
    },
};

// Users API
export const usersApi = {
    getAll: async () => {
        const response = await api.get('/api/users');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/users', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/api/users/${id}`, data);
        return response.data;
    },
    getRoles: async () => {
        const response = await api.get('/api/users/roles');
        return response.data;
    },
};


// Inventory API
export const inventoryApi = {
    getAll: async (params?: { skip?: number; limit?: number }) => {
        const response = await api.get('/api/inventory', { params });
        return response.data;
    },
    getSummary: async () => {
        const response = await api.get('/api/inventory/summary');
        return response.data;
    },
    getLots: async () => {
        const response = await api.get('/api/inventory/lots');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/api/inventory', data);
        return response.data;
    },
    adjust: async (id: string, quantity: number, reason: string) => {
        const response = await api.patch(`/api/inventory/${id}/adjust`, null, {
            params: { quantity_adjustment: quantity, reason }
        });
        return response.data;
    },
    createLot: async (data: any) => {
        const response = await api.post('/api/inventory/lots', data);
        return response.data;
    },
};

// QC API
export const qcApi = {
    getInspectionPlans: async () => {
        const response = await api.get('/api/qc/inspection-plans');
        return response.data;
    },
    getInspections: async () => {
        const response = await api.get('/api/qc/inspections');
        return response.data;
    },
    createInspection: async (data: any) => {
        const response = await api.post('/api/qc/inspections', data);
        return response.data;
    },
    createInspectionPlan: async (data: any) => {
        const response = await api.post('/api/qc/inspection-plans', data);
        return response.data;
    },
};

// HR API
export const hrApi = {
    getEmployees: async () => {
        const response = await api.get('/api/hr/employees');
        return response.data;
    },
    createEmployee: async (data: any) => {
        const response = await api.post('/api/hr/employees', data);
        return response.data;
    },
    getTrainingSessions: async () => {
        const response = await api.get('/api/hr/training-sessions');
        return response.data;
    },
    createTrainingSession: async (data: any) => {
        const response = await api.post('/api/hr/training-sessions', data);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/api/hr/stats');
        return response.data;
    },
    getCompetencyMatrix: async () => {
        const response = await api.get('/api/hr/competency-matrix');
        return response.data;
    },
};

// Maintenance API
export const maintenanceApi = {
    getEquipment: async () => {
        const response = await api.get('/api/maintenance/equipment');
        return response.data;
    },
    createEquipment: async (data: any) => {
        const response = await api.post('/api/maintenance/equipment', data);
        return response.data;
    },
    getPreventiveMaintenance: async () => {
        const response = await api.get('/api/maintenance/preventive-maintenance');
        return response.data;
    },
    createPreventiveMaintenance: async (data: any) => {
        const response = await api.post('/api/maintenance/preventive-maintenance', data);
        return response.data;
    },
    getBreakdowns: async () => {
        const response = await api.get('/api/maintenance/breakdowns');
        return response.data;
    },
    createBreakdown: async (data: any) => {
        const response = await api.post('/api/maintenance/breakdowns', data);
        return response.data;
    },
    getCleaningRecords: async () => {
        const response = await api.get('/api/maintenance/cleaning-records');
        return response.data;
    },
};

// Marketing API
export const marketingApi = {
    getCustomers: async () => {
        const response = await api.get('/api/marketing/customers');
        return response.data;
    },
    createCustomer: async (data: any) => {
        const response = await api.post('/api/marketing/customers', data);
        return response.data;
    },
    getInquiries: async () => {
        const response = await api.get('/api/marketing/inquiries');
        return response.data;
    },
    createInquiry: async (data: any) => {
        const response = await api.post('/api/marketing/inquiries', data);
        return response.data;
    },
    getOrders: async () => {
        const response = await api.get('/api/marketing/orders');
        return response.data;
    },
    createOrder: async (data: any) => {
        const response = await api.post('/api/marketing/orders', data);
        return response.data;
    },
    getComplaints: async () => {
        const response = await api.get('/api/marketing/complaints');
        return response.data;
    },
};

// Purchase API
export const purchaseApi = {
    getVendors: async () => {
        const response = await api.get('/api/purchase/vendors');
        return response.data;
    },
    createVendor: async (data: any) => {
        const response = await api.post('/api/purchase/vendors', data);
        return response.data;
    },
    getPurchaseOrders: async () => {
        const response = await api.get('/api/purchase/purchase-orders');
        return response.data;
    },
    createPurchaseOrder: async (data: any) => {
        const response = await api.post('/api/purchase/purchase-orders', data);
        return response.data;
    },
    getRequisitions: async () => {
        const response = await api.get('/api/purchase/requisitions');
        return response.data;
    },
    createRequisition: async (data: any) => {
        const response = await api.post('/api/purchase/requisitions', data);
        return response.data;
    },
};

// Store API
export const storeApi = {
    getMaterialInward: async () => {
        const response = await api.get('/api/store/material-inward');
        return response.data;
    },
    createMaterialInward: async (data: any) => {
        const response = await api.post('/api/store/material-inward', data);
        return response.data;
    },
    getIndentSlips: async () => {
        const response = await api.get('/api/store/indent-slips');
        return response.data;
    },
    createIndentSlip: async (data: any) => {
        const response = await api.post('/api/store/indent-slips', data);
        return response.data;
    },
    getStockRegister: async () => {
        const response = await api.get('/api/store/stock-register');
        return response.data;
    },
};

// MR/QA API
export const mrApi = {
    getAuditSchedules: async () => {
        const response = await api.get('/api/mr/audit-schedules');
        return response.data;
    },
    createAuditSchedule: async (data: any) => {
        const response = await api.post('/api/mr/audit-schedules', data);
        return response.data;
    },
    getManagementReviews: async () => {
        const response = await api.get('/api/mr/management-reviews');
        return response.data;
    },
    createManagementReview: async (data: any) => {
        const response = await api.post('/api/mr/management-reviews', data);
        return response.data;
    },
    getCorrectiveActions: async () => {
        const response = await api.get('/api/mr/corrective-actions');
        return response.data;
    },
};

// QC Extended API
export const qcExtendedApi = {
    getLeakTests: async () => {
        const response = await api.get('/api/qc-extended/leak-tests');
        return response.data;
    },
    createLeakTest: async (data: any) => {
        const response = await api.post('/api/qc-extended/leak-tests', data);
        return response.data;
    },
    getCalibrations: async () => {
        const response = await api.get('/api/qc-extended/calibrations');
        return response.data;
    },
    createCalibration: async (data: any) => {
        const response = await api.post('/api/qc-extended/calibrations', data);
        return response.data;
    },
    getFumigationRecords: async () => {
        const response = await api.get('/api/qc-extended/fumigation-records');
        return response.data;
    },
    getDistilledWaterTests: async () => {
        const response = await api.get('/api/qc-extended/distilled-water-tests');
        return response.data;
    },
};

export default api;

