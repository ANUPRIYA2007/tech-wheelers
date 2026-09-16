import Card from '../../components/common/Card';
import { User } from 'lucide-react';

export default function Farmers() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">All Farmers</h1>
      <Card>
        <p className="text-surface-500 dark:text-surface-400">Platform-wide farmer management. Connect to Supabase for real data.</p>
      </Card>
    </div>
  );
}
