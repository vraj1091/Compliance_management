import React, { useEffect, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    ClipboardCheck,
    GraduationCap,
    Factory,
    TestTube,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Clock,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { dashboardApi } from '../api';

interface KPI {
    open_ncs: number;
    open_capas: number;
    open_findings: number;
    overdue_trainings: number;
    open_work_orders: number;
    pending_inspections: number;
}

interface Activity {
    type: string;
    number: string;
    title: string;
    status: string;
    date: string;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
    const [kpis, setKpis] = useState<KPI | null>(null);
    const [ncTrend, setNcTrend] = useState<any[]>([]);
    const [capaStatus, setCapaStatus] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await dashboardApi.getDashboard();
            setKpis(data.kpis);

            // Format NC trend data
            const trendData = data.nc_trend.labels.map((label: string, idx: number) => ({
                month: label,
                count: data.nc_trend.datasets[0]?.data[idx] || 0,
            }));
            setNcTrend(trendData);

            // Format CAPA status data
            const statusData = Object.entries(data.capa_status).map(([name, value]) => ({
                name,
                value: value as number,
            }));
            setCapaStatus(statusData);

            setRecentActivity(data.recent_activity);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            // Set default data for demo
            setKpis({
                open_ncs: 2,
                open_capas: 1,
                open_findings: 0,
                overdue_trainings: 0,
                open_work_orders: 2,
                pending_inspections: 0,
            });
            setNcTrend([
                { month: 'Aug 2025', count: 3 },
                { month: 'Sep 2025', count: 5 },
                { month: 'Oct 2025', count: 2 },
                { month: 'Nov 2025', count: 4 },
                { month: 'Dec 2025', count: 1 },
                { month: 'Jan 2026', count: 2 },
            ]);
            setCapaStatus([
                { name: 'Open', value: 2 },
                { name: 'In Progress', value: 3 },
                { name: 'Closed', value: 8 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Quality & Compliance Overview</h2>
                <p className="text-muted">
                    Monitor key quality metrics and stay compliant with FDA 21 CFR Part 820
                </p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open NCs</div>
                        <div className="kpi-value">{kpis?.open_ncs || 0}</div>
                        <div className="kpi-trend down">
                            <TrendingDown size={14} />
                            Requires attention
                        </div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon primary">
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open CAPAs</div>
                        <div className="kpi-value">{kpis?.open_capas || 0}</div>
                        <div className="kpi-trend up">
                            <TrendingUp size={14} />
                            On track
                        </div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon error">
                        <ClipboardCheck size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open Findings</div>
                        <div className="kpi-value">{kpis?.open_findings || 0}</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon accent">
                        <GraduationCap size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Overdue Trainings</div>
                        <div className="kpi-value">{kpis?.overdue_trainings || 0}</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon success">
                        <Factory size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Open Work Orders</div>
                        <div className="kpi-value">{kpis?.open_work_orders || 0}</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon info">
                        <TestTube size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Pending Inspections</div>
                        <div className="kpi-value">{kpis?.pending_inspections || 0}</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* NC Trend Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">NC Trend (6 Months)</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ncTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* CAPA Status Pie Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">CAPA Status Distribution</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={capaStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {capaStatus.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Activity</h3>
                    <button className="btn btn-secondary btn-sm">
                        View All <ArrowRight size={16} />
                    </button>
                </div>
                <div className="card-body">
                    {recentActivity.length > 0 ? (
                        <ul className="activity-list">
                            {recentActivity.map((activity, idx) => (
                                <li key={idx} className="activity-item">
                                    <div
                                        className="activity-icon"
                                        style={{
                                            background: activity.type === 'NC' ? 'var(--warning-50)' : 'var(--primary-100)',
                                            color: activity.type === 'NC' ? 'var(--warning-600)' : 'var(--primary-600)',
                                        }}
                                    >
                                        {activity.type === 'NC' ? (
                                            <AlertTriangle size={18} />
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>{activity.number}</strong> - {activity.title}
                                        </div>
                                        <div className="activity-time">
                                            <Clock size={14} style={{ marginRight: '0.25rem' }} />
                                            {formatTimeAgo(activity.date)} • Status: {activity.status}
                                        </div>
                                    </div>
                                    <span
                                        className={`badge ${activity.status === 'Open' || activity.status === 'Under Investigation'
                                                ? 'badge-warning'
                                                : activity.status === 'Closed'
                                                    ? 'badge-success'
                                                    : 'badge-info'
                                            }`}
                                    >
                                        {activity.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <Clock size={48} className="empty-state-icon" />
                            <h4 className="empty-state-title">No Recent Activity</h4>
                            <p>Activity will appear here as you use the system</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
