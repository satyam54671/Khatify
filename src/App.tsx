import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from '@/app/Providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Customers } from '@/features/customers/Customers';
import { Products } from '@/features/products/Products';
import { Inventory } from '@/features/inventory/Inventory';
import { Invoices } from '@/features/invoices/Invoices';
import { Payments } from '@/features/payments/Payments';
import { Ledger } from '@/features/ledger/Ledger';
import { Reports } from '@/features/reports/Reports';
import { Analytics } from '@/features/analytics/Analytics';
import { Settings } from '@/features/settings/Settings';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout containing sidebar, navbar, and subroutes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="payments" element={<Payments />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
