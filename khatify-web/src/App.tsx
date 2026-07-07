import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from '@/app/Providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Customers } from '@/features/customers/Customers';
import { Invoices } from '@/features/invoices/Invoices';
import { Payments } from '@/features/payments/Payments';
import { Ledger } from '@/features/ledger/Ledger';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout containing sidebar, navbar, and subroutes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="payments" element={<Payments />} />
            <Route path="ledger" element={<Ledger />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
