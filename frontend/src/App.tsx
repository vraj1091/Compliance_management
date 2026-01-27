import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ModulePage from './components/ModulePage';

// Existing Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Training from './pages/Training';
import Nonconformances from './pages/Nonconformances';
import CAPAs from './pages/CAPAs';
import Audits from './pages/Audits';
import Items from './pages/Items';
import WorkOrders from './pages/WorkOrders';
import Inventory from './pages/Inventory';
import QualityControl from './pages/QualityControl';
import Users from './pages/Users';
import Settings from './pages/Settings';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Commercial */}
            <Route path="/marketing/enquiries" element={<ModulePage title="Enquiries" description="Manage customer enquiries and leads" />} />
            <Route path="/marketing/research" element={<ModulePage title="Market Research" description="AI-driven market insights and analysis" />} />
            <Route path="/marketing/quotations" element={<ModulePage title="Quotations" description="Manage costings and send quotations" />} />
            <Route path="/marketing/orders" element={<ModulePage title="Customer Orders" description="Track and process customer purchase orders" />} />
            <Route path="/marketing/internal-orders" element={<ModulePage title="Internal Work Orders" description="Issue internal orders for production" />} />

            <Route path="/purchase/vendors" element={<ModulePage title="Vendor Management" description="Registration and database of suppliers" />} />
            <Route path="/purchase/audits" element={<ModulePage title="Vendor Audits" description="Schedule and record supplier audits" />} />
            <Route path="/purchase/ratings" element={<ModulePage title="Vendor Ratings" description="Performance evaluation and rating system" />} />
            <Route path="/purchase/orders" element={<ModulePage title="Purchase Orders" description="Manage procurement and POs" />} />

            <Route path="/store/receipts" element={<ModulePage title="Material Receipt" description="Inward material processing" />} />
            <Route path="/store/issues" element={<ModulePage title="Material Issue" description="Issue materials to production" />} />
            <Route path="/store/returns" element={<ModulePage title="Material Returns" description="Manage returns from floor or to vendors" />} />
            <Route path="/inventory" element={<Inventory />} />

            {/* Operations */}
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/production/schedule" element={<ModulePage title="Production Schedule" description="Planning and scheduling of manufacturing" />} />

            <Route path="/maintenance/preventive-utility" element={<ModulePage title="Preventive Maintenance (Utilities)" />} />
            <Route path="/maintenance/preventive-shop" element={<ModulePage title="Preventive Maintenance (Shopfloor)" />} />
            <Route path="/maintenance/breakdown" element={<ModulePage title="Breakdown Maintenance" />} />

            <Route path="/service/installation" element={<ModulePage title="Installation" description="Product installation records" />} />
            <Route path="/service/servicing" element={<ModulePage title="Servicing" description="After-sales service and repairs" />} />

            {/* Quality Management */}
            <Route path="/design/planning" element={<ModulePage title="Design Planning" description="Design and development planning inputs" />} />
            <Route path="/design/review" element={<ModulePage title="Design Review" description="Periodic reviews of design outputs" />} />
            <Route path="/design/verification" element={<ModulePage title="Design Verification" description="Verification against requirements" />} />
            <Route path="/design/transfer" element={<ModulePage title="Design Transfer" description="Transfer to manufacturing" />} />
            <Route path="/design/changes" element={<ModulePage title="Design Changes" description="Change control and D&D files" />} />

            <Route path="/audits" element={<Audits />} />
            <Route path="/mr" element={<ModulePage title="Management Review" description="MRM schedules and minutes" />} />
            <Route path="/nc" element={<Nonconformances />} />
            <Route path="/capa" element={<CAPAs />} />
            <Route path="/risk" element={<ModulePage title="Risk Analysis" description="ISO 14971 Risk Management" />} />
            <Route path="/pms" element={<ModulePage title="Post Market Surveillance" description="Feedback and PMS reports" />} />

            <Route path="/qc" element={<QualityControl />} />
            <Route path="/qc/calibration" element={<ModulePage title="Calibration" description="Equipment calibration schedules and records" />} />
            <Route path="/qc/bio" element={<ModulePage title="Biocompatibility" description="Biocompatibility test reports" />} />
            <Route path="/qc/cleanroom" element={<ModulePage title="Cleanroom Validation" description="Environmental monitoring and validation" />} />
            <Route path="/qc/software" element={<ModulePage title="Software Validation" description="GAMP5 software validation records" />} />
            <Route path="/qc/emc" element={<ModulePage title="EMC Reports" description="Electromagnetic compatibility testing" />} />

            {/* Organization */}
            <Route path="/hr/employees" element={<ModulePage title="Employees" description="Employee database and profiles" />} />
            <Route path="/hr/competence" element={<ModulePage title="Competence Matrix" description="Skill mapping and gap analysis" />} />
            <Route path="/training" element={<Training />} />
            <Route path="/hr/medical" element={<ModulePage title="Medical History" description="Employee health records" />} />

            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/external" element={<ModulePage title="External Documents" description="Manage standards and regulations" />} />
            <Route path="/documents/literature" element={<ModulePage title="Literature Review" description="Clinical evaluation literature" />} />
            <Route path="/documents/promotional" element={<ModulePage title="Promotional Material" description="Brochures and catalogs" />} />

            <Route path="/items" element={<Items />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
