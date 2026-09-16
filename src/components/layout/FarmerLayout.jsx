import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

export default function FarmerLayout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        <Header />
        <main className="p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
