import Card from '../../components/common/Card';
import { UserCog } from 'lucide-react';

export default function Admins() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Admin Management</h1>
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <UserCog className="w-6 h-6 text-primary-600" />
          <h3 className="font-semibold text-surface-900 dark:text-white">Local Admin Management</h3>
        </div>
        <p className="text-surface-500 dark:text-surface-400">
          Manage local admins and their centre assignments. Connect to Supabase for real data.
        </p>
      </Card>
    </div>
  );
}
