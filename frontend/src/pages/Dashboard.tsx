import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    CheckCircle,
    GraduationCap,
    Factory,
    ArrowRight,
    ShoppingCart,
    Building2,
    Users,
    Wrench,
    Boxes,
    Activity,
    TrendingUp,
    Clock,
    FileText
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Imitate loading for effect
        setTimeout(() => setLoading(false), 800);
    }, []);

    const departments = [
        { label: 'Marketing', icon: <ShoppingCart size={24} />, path: '/marketing/enquiries', theme: 'primary', count: '3 New Enquiries', trend: '+12%' },
        { label: 'Purchase', icon: <Building2 size={24} />, path: '/purchase/orders', theme: 'warning', count: '2 Pending POs', trend: 'Urgent' },
        { label: 'HR', icon: <Users size={24} />, path: '/hr/employees', theme: 'success', count: '142 Active', trend: 'Stable' },
        { label: 'Operations', icon: <Factory size={24} />, path: '/work-orders', theme: 'info', count: '8 Running', trend: '98% Eff.' },
        { label: 'Stores', icon: <Boxes size={24} />, path: '/inventory', theme: 'warning', count: 'Low Stock: 4', trend: '-2 Items' },
        { label: 'Maintenance', icon: <Wrench size={24} />, path: '/maintenance/preventive-shop', theme: 'error', count: '1 Due Today', trend: 'Critical' },
    ];

    const chartData = [
        { name: 'Mon', value: 85 },
        { name: 'Tue', value: 88 },
        { name: 'Wed', value: 87 },
        { name: 'Thu', value: 92 },
        { name: 'Fri', value: 95 },
        { name: 'Sat', value: 94 },
        { name: 'Sun', value: 96 },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Premium Hero Section */}
            <div className="mb-8 p-8 rounded-2xl relative overflow-hidden shadow-premium"
                style={{
                    background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 100%)',
                    color: 'white'
                }}>
                {/* Abstract Shapes */}
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>

                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2.5rem' }}>Welcome back, Admin</h1>
                        <div className="flex items-center gap-4 text-primary-100">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                <Activity size={16} />
                                <span>System Status: <strong className="text-white">Optimal</strong></span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                <CheckCircle size={16} />
                                <span>Compliance Score: <strong className="text-white">98%</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Grid */}
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Boxes size={20} /> Department Overview
            </h3>

            <div className="grid-3 mb-8" style={{ gap: '1.5rem' }}>
                {departments.map((dept, idx) => (
                    <div
                        key={idx}
                        className="card p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group"
                        onClick={() => navigate(dept.path)}
                        style={{ borderLeft: `4px solid var(--${dept.theme}-500)` }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${dept.theme}-50 text-${dept.theme}-600`} style={{ background: `var(--${dept.theme}-bg)`, color: `var(--${dept.theme}-500)` }}>
                                {dept.icon}
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                {dept.trend}
                            </div>
                        </div>
                        <div className="font-bold text-lg mb-1">{dept.label}</div>
                        <div className="text-sm text-muted flex items-center justify-between">
                            {dept.count}
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics & Tasks */}
            <div className="grid-2 mb-8" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Chart Card */}
                <div className="card full-height">
                    <div className="card-header flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-500" />
                            <h3 className="card-title m-0">Performance Analytics</h3>
                        </div>
                        <select className="form-input py-1 px-3 text-sm" style={{ width: 'auto' }}>
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                    <div className="card-body" style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} domain={[60, 100]} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KPI Sidebar */}
                <div className="flex flex-col gap-4">
                    <div className="card p-4 flex items-center gap-4 border-l-4 border-l-warning-500">
                        <div className="p-3 rounded-xl bg-warning-bg text-warning-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">2</div>
                            <div className="text-sm text-muted">Open Non-Conformances</div>
                        </div>
                    </div>

                    <div className="card p-4 flex items-center gap-4 border-l-4 border-l-success-500">
                        <div className="p-3 rounded-xl bg-success-bg text-success-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">1</div>
                            <div className="text-sm text-muted">Active CAPAs</div>
                        </div>
                    </div>

                    <div className="card p-4 flex items-center gap-4 border-l-4 border-l-info-500">
                        <div className="p-3 rounded-xl bg-info-bg text-info-500">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-sm text-muted">Pending Trainings</div>
                        </div>
                    </div>

                    <div className="card p-5 mt-auto flex-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock size={16} /> Recent Activity
                        </h4>
                        <div className="space-y-3 relative z-10">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                <div className="opacity-80">John D. updated NC-2024-001 <span className="text-xs opacity-50 block">2 mins ago</span></div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400 shrink-0"></div>
                                <div className="opacity-80">System backup completed <span className="text-xs opacity-50 block">1 hour ago</span></div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 shrink-0"></div>
                                <div className="opacity-80">New Policy Document released <span className="text-xs opacity-50 block">4 hours ago</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Action Table */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h3 className="card-title gap-2">
                        <FileText size={20} /> Action Items
                    </h3>
                    <button className="btn btn-secondary btn-sm">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Priority</th>
                                <th>Timeline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="font-mono text-sm font-medium text-primary-600">NC-2024-001</td>
                                <td><span className="badge badge-error">Non-Conformance</span></td>
                                <td className="font-medium text-gray-700">Material density failure in Batch B-402</td>
                                <td><span className="text-error-500 font-bold text-xs uppercase tracking-wider">High</span></td>
                                <td className="text-sm">Due Tomorrow</td>
                                <td><span className="badge badge-warning">Investigation</span></td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="font-mono text-sm font-medium text-primary-600">TR-2024-015</td>
                                <td><span className="badge badge-info">Training</span></td>
                                <td className="font-medium text-gray-700">Q2 SOP Updates Training for Production</td>
                                <td><span className="text-warning-500 font-bold text-xs uppercase tracking-wider">Medium</span></td>
                                <td className="text-sm">Oct 15, 2026</td>
                                <td><span className="badge badge-info">Pending</span></td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="font-mono text-sm font-medium text-primary-600">PO-9902</td>
                                <td><span className="badge badge-warning">Purchase</span></td>
                                <td className="font-medium text-gray-700">Approval for Raw Material Order</td>
                                <td><span className="text-success-500 font-bold text-xs uppercase tracking-wider">Normal</span></td>
                                <td className="text-sm">Oct 18, 2026</td>
                                <td><span className="badge badge-success">Approved</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
