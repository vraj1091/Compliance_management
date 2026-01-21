import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    AlertTriangle,
    CheckCircle,
    ClipboardCheck,
    Package,
    Factory,
    Warehouse,
    TestTube,
    Users,
    Settings,
    ChevronDown,
    ChevronRight,
    Shield,
    Wrench,
    ShoppingCart,
    Building2,
    Boxes,
    UserCheck,
    FlaskConical,
} from 'lucide-react';

interface NavItem {
    label: string;
    path?: string;
    icon: React.ReactNode;
    children?: { label: string; path: string }[];
}

const navigation: { section: string; items: NavItem[] }[] = [
    {
        section: 'Overview',
        items: [
            { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        ],
    },
    {
        section: 'Quality',
        items: [
            { label: 'Documents', path: '/documents', icon: <FileText size={20} /> },
            { label: 'Training', path: '/training', icon: <GraduationCap size={20} /> },
            { label: 'Nonconformances', path: '/nc', icon: <AlertTriangle size={20} /> },
            { label: 'CAPAs', path: '/capa', icon: <CheckCircle size={20} /> },
            { label: 'Audits', path: '/audits', icon: <ClipboardCheck size={20} /> },
            { label: 'MR / QA', path: '/mr', icon: <UserCheck size={20} /> },
        ],
    },
    {
        section: 'Manufacturing',
        items: [
            { label: 'Items', path: '/items', icon: <Package size={20} /> },
            { label: 'Work Orders', path: '/work-orders', icon: <Factory size={20} /> },
            { label: 'Inventory', path: '/inventory', icon: <Warehouse size={20} /> },
            { label: 'Quality Control', path: '/qc', icon: <TestTube size={20} /> },
            { label: 'QC Lab Records', path: '/qc-lab', icon: <FlaskConical size={20} /> },
        ],
    },
    {
        section: 'Departments',
        items: [
            { label: 'HR', path: '/hr', icon: <Users size={20} /> },
            { label: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} /> },
            { label: 'Marketing', path: '/marketing', icon: <ShoppingCart size={20} /> },
            { label: 'Purchase', path: '/purchase', icon: <Building2 size={20} /> },
            { label: 'Store', path: '/store', icon: <Boxes size={20} /> },
        ],
    },
    {
        section: 'Administration',
        items: [
            { label: 'Users', path: '/users', icon: <Users size={20} /> },
            { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
        ],
    },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <NavLink to="/dashboard" className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Shield size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>QMS-ERP</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Medical Device</div>
                    </div>
                </NavLink>
            </div>

            <nav className="sidebar-nav">
                {navigation.map((section) => (
                    <div key={section.section} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) =>
                            item.children ? (
                                <div key={item.label}>
                                    <div
                                        className="nav-item"
                                        onClick={() => toggleExpanded(item.label)}
                                    >
                                        <span className="nav-item-icon">{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </div>
                                    {expandedItems.includes(item.label) && (
                                        <div style={{ marginLeft: '2rem' }}>
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `nav-item ${isActive ? 'active' : ''}`
                                                    }
                                                >
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path!}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-item-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            )
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
