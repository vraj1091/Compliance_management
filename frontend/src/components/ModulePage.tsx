import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, BarChart3, FileText, Plus, Search, Filter } from 'lucide-react';

interface ModulePageProps {
    title: string;
    description?: string;
    kpis?: { label: string; value: string; trend?: string; color: 'primary' | 'success' | 'warning' | 'info' }[];
}

const ModulePage: React.FC<ModulePageProps> = ({ title, description, kpis }) => {
    const location = useLocation();

    // Default KPIs if none provided
    const defaultKpis = [
        { label: 'Total Records', value: '142', trend: '+12%', color: 'primary' },
        { label: 'Active Items', value: '89', trend: '+5%', color: 'success' },
        { label: 'Pending Actions', value: '12', trend: '-2%', color: 'warning' },
        { label: 'This Month', value: '24', trend: '+8%', color: 'info' },
    ];

    const activeKpis = kpis || defaultKpis;

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text' }}>
                        {title}
                    </h1>
                    <p className="text-muted mt-1" style={{ fontSize: '1rem' }}>
                        {description || `Manage ${title.toLowerCase()} and related activities`}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary">
                        <FileText size={18} />
                        Reports
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Create New
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                {activeKpis.map((kpi, index) => (
                    <div key={index} className="kpi-card">
                        <div className={`kpi-icon ${kpi.color}`}>
                            <BarChart3 size={24} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">{kpi.label}</div>
                            <div className="kpi-value">{kpi.value}</div>
                            {kpi.trend && (
                                <div className={`kpi-trend ${kpi.trend.startsWith('+') ? 'text-success' : 'text-error'}`} style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {kpi.trend.startsWith('+') ? '↑' : '↓'} {kpi.trend} vs last month
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <div className="card-title">
                        Recent Records
                    </div>
                    <div className="flex gap-4">
                        <div className="relative" style={{ width: '300px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search records..."
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Search
                                size={18}
                                className="text-muted"
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                            />
                        </div>
                        <button className="btn btn-secondary btn-icon">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item}>
                                    <td style={{ fontWeight: 600 }}>{title.substring(0, 3).toUpperCase()}-{2024000 + item}</td>
                                    <td>Sample {title} Record #{item} description</td>
                                    <td>
                                        <span className={`badge badge-${item % 2 === 0 ? 'success' : item % 3 === 0 ? 'warning' : 'primary'}`}>
                                            {item % 2 === 0 ? 'Active' : item % 3 === 0 ? 'Pending' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="flex items-center gap-2">
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>JD</div>
                                        John Doe
                                    </td>
                                    <td>{new Date().toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State / Pagination Placeholder */}
                    <div className="flex justify-between items-center" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <div className="text-sm text-muted">Showing 5 of 142 results</div>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary btn-sm" disabled>Previous</button>
                            <button className="btn btn-secondary btn-sm">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulePage;
