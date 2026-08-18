import { useState, useEffect } from 'react'
import api from '../../services/api'
import { HardDrive, Cpu, Database, Globe, RefreshCw, FileText, Users, HeartHandshake, FolderGit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemInfo {
  python_version: string
  fastapi_version: string
  database: string
  os: string
  stats?: {
    users: number
    accounts: number
    journals: number
    donations: number
    projects: number
    donors: number
  }
}

export default function SystemManager() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchInfo = () => {
    api.get('/system/info').then((res) => {
      setInfo(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  const handleClearCache = async () => {
    try {
      await api.post('/system/clear-cache')
      toast.success('تم مسح الذاكرة المؤقتة بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في مسح الذاكرة المؤقتة')
    }
  }

  const handleRestart = async () => {
    if (!confirm('هل أنت متأكد من إعادة تشغيل النظام؟ سيتم قطع الاتصال.')) return
    try {
      await api.post('/system/restart')
      toast.success('جاري إعادة تشغيل النظام...')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في إعادة التشغيل')
    }
  }

  const handleSeedData = async (reset: boolean = true) => {
    if (!confirm(reset ? 'هل تريد استبدال/إعادة تعيين البيانات بقاعدة بيانات وهمية تجريبية شاملة؟' : 'هل تريد إضافة بيانات تجريبية بقاعدة البيانات؟')) return
    setSeeding(true)
    try {
      const res = await api.post(`/system/seed-data?reset=${reset}`)
      toast.success(res.data?.message || 'تم إدخال البيانات الوهمية بنجاح')
      fetchInfo()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'حدث خطأ أثناء توليد البيانات الوهمية')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900">مدير النظام</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-600">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">مدير النظام وقاعدة البيانات</h1>
        <button
          onClick={() => handleSeedData(true)}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
        >
          <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
          {seeding ? 'جاري التوليد...' : 'توليد بيانات وهمية تجريبية'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Cpu size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">إصدار Python</p>
              <p className="font-semibold text-slate-900">{info?.python_version || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Globe size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">إصدار FastAPI</p>
              <p className="font-semibold text-slate-900">{info?.fastapi_version || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Database size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">قاعدة البيانات</p>
              <p className="font-semibold text-slate-900">{info?.database || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <HardDrive size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">نظام التشغيل</p>
              <p className="font-semibold text-slate-900">{info?.os || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {info?.stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">إحصائيات البيانات المسجلة في القاعدة</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <Users className="mx-auto mb-2 text-blue-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.users}</p>
              <p className="text-xs text-slate-500">المستخدمين</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <FileText className="mx-auto mb-2 text-indigo-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.accounts}</p>
              <p className="text-xs text-slate-500">دليل الحسابات</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <Database className="mx-auto mb-2 text-emerald-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.journals}</p>
              <p className="text-xs text-slate-500">قيود اليومية</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <HeartHandshake className="mx-auto mb-2 text-pink-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.donations}</p>
              <p className="text-xs text-slate-500">التبرعات</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <FolderGit2 className="mx-auto mb-2 text-amber-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.projects}</p>
              <p className="text-xs text-slate-500">المشاريع</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <Users className="mx-auto mb-2 text-teal-600" size={20} />
              <p className="text-2xl font-bold text-slate-900">{info.stats.donors}</p>
              <p className="text-xs text-slate-500">المتبرعين</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">إجراءات النظام وقواعد البيانات</h3>
          <p className="text-sm text-slate-500 mt-1">إجراءات متقدمة لتجربة وإدارة البيانات والتطبيقات</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div>
              <h4 className="font-medium text-emerald-900">توليد بيانات وهمية تجريبية كاملة (Seed Mock Data)</h4>
              <p className="text-sm text-emerald-700">تجهيز شجرة حسابات محاسبية، قيود يومية، تبرعات، مشاريع، موازنات ومتبرعين لاختبار كافة واجهات وتقارير النظام</p>
            </div>
            <button
              onClick={() => handleSeedData(true)}
              disabled={seeding}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {seeding ? 'جاري التوليد...' : 'توليد البيانات'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900">مسح الذاكرة المؤقتة</h4>
              <p className="text-sm text-slate-500">مسح جميع البيانات المؤقتة المخزنة في الذاكرة</p>
            </div>
            <button onClick={handleClearCache} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              مسح الذاكرة
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900">إعادة تشغيل النظام</h4>
              <p className="text-sm text-slate-500">إعادة تشغيل خدمة النظام (يؤدي إلى قطع الاتصال)</p>
            </div>
            <button onClick={handleRestart} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              إعادة تشغيل
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
