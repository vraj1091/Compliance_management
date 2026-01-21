import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
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
// New Department Pages
import HR from './pages/HR';
import Maintenance from './pages/Maintenance';
import Marketing from './pages/Marketing';
import Purchase from './pages/Purchase';
import Store from './pages/Store';
import MR from './pages/MR';
import QCExtended from './pages/QCExtended';
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
            <Route path="/documents" element={<Documents />} />
            <Route path="/training" element={<Training />} />
            <Route path="/nc" element={<Nonconformances />} />
            <Route path="/capa" element={<CAPAs />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/items" element={<Items />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/qc" element={<QualityControl />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            {/* New Department Routes */}
            <Route path="/hr" element={<HR />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/store" element={<Store />} />
            <Route path="/mr" element={<MR />} />
            <Route path="/qc-lab" element={<QCExtended />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
