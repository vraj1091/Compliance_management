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
    Search,
    BookOpen,
    BarChart3,
    Activity,
    RefreshCw,
    Truck,
    Microscope,
    Zap,
    Scale,
    FileCheck,
    FlaskConical,
    UserCheck,
} from 'lucide-react';

interface NavItem {
    label: string;
    path?: string;
    icon: React.ReactNode;
    children?: { label: string; path: string }[];
}

// Full navigation structure based on the provided detailed mind map
const navigation: { section: string; items: NavItem[] }[] = [
    {
        section: 'Core',
        items: [
            { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        ],
    },
    {
        section: 'Commercial',
        items: [
            {
                label: 'Marketing',
                icon: <ShoppingCart size={18} />,
                children: [
                    { label: 'Enquiries', path: '/marketing/enquiries' },
                    { label: 'Market Research (AI)', path: '/marketing/research' },
                    { label: 'Costing & Quotation', path: '/marketing/quotations' },
                    { label: 'Customer PO', path: '/marketing/orders' },
                    { label: 'Internal Work Order', path: '/marketing/internal-orders' },
                ],
            },
            {
                label: 'Purchase',
                icon: <Building2 size={18} />,
                children: [
                    { label: 'Vendors', path: '/purchase/vendors' },
                    { label: 'Vendor Audit', path: '/purchase/audits' },
                    { label: 'Vendor Rating', path: '/purchase/ratings' },
                    { label: 'Purchase Orders', path: '/purchase/orders' },
                ],
            },
            {
                label: 'Stores',
                icon: <Boxes size={18} />,
                children: [
                    { label: 'Material Receipt', path: '/store/receipts' },
                    { label: 'Material Issue', path: '/store/issues' },
                    { label: 'Material Return', path: '/store/returns' },
                    { label: 'Inventory', path: '/inventory' },
                ],
            },
        ],
    },
    {
        section: 'Operations',
        items: [
            {
                label: 'Production',
                path: '/work-orders',
                icon: <Factory size={18} />,
                children: [
                    { label: 'Work Orders', path: '/work-orders' },
                    { label: 'Schedule', path: '/production/schedule' },
                ]
            },
            {
                label: 'Maintenance',
                icon: <Wrench size={18} />,
                children: [
                    { label: 'Preventive (Utilities)', path: '/maintenance/preventive-utility' },
                    { label: 'Preventive (Shopfloor)', path: '/maintenance/preventive-shop' },
                    { label: 'Breakdown', path: '/maintenance/breakdown' },
                ],
            },
            {
                label: 'Service & Install',
                icon: <Truck size={18} />,
                children: [
                    { label: 'Installation', path: '/service/installation' },
                    { label: 'Servicing', path: '/service/servicing' },
                ],
            },
        ],
    },
    {
        section: 'Quality Management',
        items: [
            {
                label: 'Design & Dev',
                icon: <Microscope size={18} />,
                children: [
                    { label: 'Planning & Inputs', path: '/design/planning' },
                    { label: 'Outputs & Review', path: '/design/review' },
                    { label: 'Verification & Install', path: '/design/verification' },
                    { label: 'Design Transfer', path: '/design/transfer' },
                    { label: 'Changes & Files', path: '/design/changes' },
                ],
            },
            {
                label: 'QA & Compliance',
                icon: <CheckCircle size={18} />,
                children: [
                    { label: 'Internal Audit', path: '/audits' },
                    { label: 'Management Review', path: '/mr' },
                    { label: 'Non-Conformances', path: '/nc' },
                    { label: 'CAPA', path: '/capa' },
                    { label: 'Risk Analysis', path: '/risk' },
                    { label: 'Post Market Surv.', path: '/pms' },
                ],
            },
            {
                label: 'Testing & Validation',
                icon: <TestTube size={18} />,
                children: [
                    { label: 'Calibration', path: '/qc/calibration' },
                    { label: 'Biocompatibility', path: '/qc/bio' },
                    { label: 'Cleanroom', path: '/qc/cleanroom' },
                    { label: 'Software Validation', path: '/qc/software' },
                    { label: 'EMC Reports', path: '/qc/emc' },
                ],
            },
        ],
    },
    {
        section: 'Organization',
        items: [
            {
                label: 'Human Resources',
                icon: <Users size={18} />,
                children: [
                    { label: 'Employees', path: '/hr/employees' },
                    { label: 'Competence', path: '/hr/competence' },
                    { label: 'Training', path: '/training' },
                    { label: 'Medical History', path: '/hr/medical' },
                ],
            },
            {
                label: 'Documentation',
                icon: <FileText size={18} />,
                children: [
                    { label: 'Internal Docs', path: '/documents' },
                    { label: 'External Origin', path: '/documents/external' },
                    { label: 'Literature Review', path: '/documents/literature' },
                    { label: 'Promotional', path: '/documents/promotional' },
                ],
            },
            { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
        ],
    },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    // Auto-expand active groups
    React.useEffect(() => {
        navigation.forEach(section => {
            section.items.forEach(item => {
                if (item.children && item.children.some(child => location.pathname.startsWith(child.path))) {
                    setExpandedItems(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
                }
            });
        });
    }, [location.pathname]);

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
                        <Shield size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Nexus QMS</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>Enterprise Edition</div>
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
                                        className={`nav-item ${expandedItems.includes(item.label) ? 'expanded' : ''}`}
                                        onClick={() => toggleExpanded(item.label)}
                                    >
                                        <span className="nav-item-icon">{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={14} />
                                        ) : (
                                            <ChevronRight size={14} />
                                        )}
                                    </div>
                                    {expandedItems.includes(item.label) && (
                                        <div style={{ marginLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `nav-item ${isActive ? 'active' : ''}`
                                                    }
                                                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
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
