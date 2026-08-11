import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Settings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/settings').then((res) => {
      setSettings(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSave = () => {
    api.put('/settings', settings).then(() => {
      alert('تم حفظ الإعدادات بنجاح')
    })
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">إعدادات المؤسسة</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المؤسسة</label>
            <input
              type="text"
              value={settings?.company_name || ''}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
            <input
              type="text"
              value={settings?.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد</label>
            <input
              type="text"
              value={settings?.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">العملة الأساسية</label>
            <input
              type="text"
              value={settings?.base_currency || 'EGP'}
              onChange={(e) => setSettings({ ...settings, base_currency: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6">
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  )
}
