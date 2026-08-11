import { useEffect, useState } from 'react'
import api from '../services/api'
import { Save, Upload, Building2, Phone, Mail, MapPin, DollarSign, Calendar, Hash, FileText, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsData {
  company_name: string
  logo_path: string
  address: string
  phone: string
  email: string
  base_currency: string
  fiscal_year: number
  date_format: string
  number_format: string
  backup_schedule: string
  backup_retention_days: number
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      setSettings(res.data)
    } catch (error) {
      toast.error('فشل في تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">جاري التحميل...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">فشل في تحميل الإعدادات</div>
      </div>
    )
  }

  const tabs = [
    { id: 'company', label: 'معلومات المؤسسة', icon: Building2 },
    { id: 'system', label: 'إعدادات النظام', icon: FileText },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: Clock },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">إعدادات المؤسسة</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          <Save size={20} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-slate-200">
          <nav className="flex gap-4 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  {settings.logo_path ? (
                    <img src={settings.logo_path} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Upload className="text-slate-400" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">شعار المؤسسة</h3>
                  <p className="text-sm text-slate-500">ارفع شعار المؤسسة (PNG, JPG, SVG)</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">تغيير الشعار</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم المؤسسة *</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العملة الأساسية</label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={settings.base_currency}
                      onChange={(e) => setSettings({ ...settings, base_currency: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EGP">EGP - جنيه مصري</option>
                      <option value="USD">USD - دولار أمريكي</option>
                      <option value="EUR">EUR - يورو</option>
                      <option value="SAR">SAR - ريال سعودي</option>
                      <option value="AED">AED - درهم إماراتي</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">السنة المالية</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="number"
                      value={settings.fiscal_year || new Date().getFullYear()}
                      onChange={(e) => setSettings({ ...settings, fiscal_year: Number(e.target.value) })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تنسيق التاريخ</label>
                  <select
                    value={settings.date_format}
                    onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="%Y-%m-%d">YYYY-MM-DD</option>
                    <option value="%d/%m/%Y">DD/MM/YYYY</option>
                    <option value="%m/%d/%Y">MM/DD/YYYY</option>
                    <option value="%Y/%m/%d">YYYY/MM/DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تنسيق الأرقام</label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={settings.number_format}
                      onChange={(e) => setSettings({ ...settings, number_format: e.target.value })}
                      className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="###,##0.00">1,000.00 (US)</option>
                      <option value="###,##0.000">1,000.000 (US 3 decimals)</option>
                      <option value="###.##0,00">1.000,00 (EU)</option>
                      <option value="###.##0,000">1.000,000 (EU 3 decimals)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">جدولة النسخ الاحتياطي</label>
                  <input
                    type="text"
                    value={settings.backup_schedule}
                    onChange={(e) => setSettings({ ...settings, backup_schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0 2 * * *"
                  />
                  <p className="text-xs text-slate-500 mt-1">تنسيق Cron: دقيقة ساعة يوم شهر يوم-أسبوع</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاحتفاظ بالنسخ (أيام)</label>
                  <input
                    type="number"
                    value={settings.backup_retention_days}
                    onChange={(e) => setSettings({ ...settings, backup_retention_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-slate-500 mt-1">سيتم حذف النسخ الأقدم من هذه المدة تلقائياً</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">مثال على جداولة Cron</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">0 2 * * *</code> - يومياً الساعة 2:00 صباحاً</li>
                  <li><code className="bg-blue-100 px-1 rounded">0 2 * * 0</code> - أسبوعياً الأحد الساعة 2:00 صباحاً</li>
                  <li><code className="bg-blue-100 px-1 rounded">0 2 1 * *</code> - شهرياً أول كل شهر الساعة 2:00 صباحاً</li>
                  <li><code className="bg-blue-100 px-1 rounded">0 */6 * * *</code> - كل 6 ساعات</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
