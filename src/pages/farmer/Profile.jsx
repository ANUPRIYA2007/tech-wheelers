import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Phone, Mail, MapPin, Shield, Save } from 'lucide-react';

export default function Profile() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    farmerId: profile?.farmers?.[0]?.farmer_id || 'FRM-TN-2026-001',
    village: profile?.farmers?.[0]?.village || 'Thiruvaiyaru',
    district: profile?.farmers?.[0]?.district || 'Thanjavur',
    state: profile?.farmers?.[0]?.state || 'Tamil Nadu',
    govIdVerified: profile?.farmers?.[0]?.government_id_verified || true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('profile')}</h1>
        <p className="page-subtitle">Manage your farmer profile</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="font-bold text-surface-900 dark:text-white">{form.fullName || 'Farmer'}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{form.farmerId}</p>
          <div className="mt-3 flex justify-center">
            {form.govIdVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                <Shield className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                Pending Verification
              </span>
            )}
          </div>
        </Card>

        {/* Info Form */}
        <Card className="md:col-span-2">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('fullName')}</label>
              <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('phone')}</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('village')}</label>
              <input type="text" value={form.village} onChange={e => setForm({...form, village: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('district')}</label>
              <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('state')}</label>
              <input type="text" value={form.state} readOnly className="input bg-surface-50 dark:bg-surface-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('farmerId')}</label>
              <input type="text" value={form.farmerId} readOnly className="input bg-surface-50 dark:bg-surface-700" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button><Save className="w-4 h-4" /> {t('save')}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
