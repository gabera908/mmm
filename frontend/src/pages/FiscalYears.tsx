import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2, Lock, Unlock, RefreshCw } from 'lucide-react'
import { FiscalYear, AccountingPeriod } from '../types'
import toast from 'react-hot-toast'

export default function FiscalYears() {
  const [years, setYears] = useState<FiscalYear[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingYear, setEditingYear] = useState<FiscalYear | null>(null)
  const [selectedYear, setSelectedYear] = useState<FiscalYear | null>(null)

  useEffect(() => {
    api.get('/fiscal-years').then((res) => setYears(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/fiscal-years/${id}`)
      toast.success('تم الحذف بنجاح')
      setYears(years.filter((y) => y.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (year?: FiscalYear) => {
    setEditingYear(year || null)
    setShowModal(true)
  }

  const viewYear = async (year: FiscalYear) => {
    setSelectedYear(year)
    try {
      const res = await api.get(`/fiscal-years/${year.id}`)
      setSelectedYear(res.data)
    } catch {
      // keep existing data
    }
  }

  const toggleCloseYear = async (year: FiscalYear) => {
    const action = year.is_closed ? 'فتح' : 'إغلاق'
    if (!confirm(`هل أنت متأكد من ${action} السنة المالية ${year.year}؟`)) return
    try {
      await api.post(`/fiscal-years/${year.id}/${year.is_closed ? 'open' : 'close'}`)
      toast.success(`تم ${action} السنة المالية بنجاح`)
      api.get('/fiscal-years').then((res) => setYears(res.data))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ')
    }
  }

  const toggleClosePeriod = async (period: AccountingPeriod) => {
    const action = period.is_closed ? 'فتح' : 'إغلاق'
    if (!confirm(`هل أنت متأكد من ${action} الفترة ${period.name}؟`)) return
    try {
      await api.post(`/periods/${period.id}/${period.is_closed ? 'open' : 'close'}`)
      toast.success(`تم ${action} الفترة بنجاح`)
      const res = await api.get(`/fiscal-years/${period.fiscal_year_id}`)
      setSelectedYear(res.data)
      api.get('/fiscal-years').then((res) => setYears(res.data))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ')
    }
  }

  const carryForward = async (yearId: number) => {
    if (!confirm('هل أنت متأكد من ترحيل الأرصدة للسنة الجديدة؟')) return
    try {
      await api.post(`/fiscal-years/${yearId}/carry-forward`)
      toast.success('تم ترحيل الأرصدة بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في ترحيل الأرصدة')
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">السنوات المالية</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة سنة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">السنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ البداية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ النهاية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {years.map((year) => (
              <tr key={year.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{year.year}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{year.start_date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{year.end_date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${year.is_closed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {year.is_closed ? 'مغلقة' : 'مفتوحة'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button onClick={() => viewYear(year)} className="text-blue-600 hover:text-blue-800" title="عرض الفترات">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => toggleCloseYear(year)} className={year.is_closed ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'} title={year.is_closed ? 'فتح' : 'إغلاق'}>
                    {year.is_closed ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                  <button onClick={() => carryForward(year.id)} className="text-purple-600 hover:text-purple-800" title="ترحيل الأرصدة">
                    <RefreshCw size={16} />
                  </button>
                  <button onClick={() => handleDelete(year.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedYear && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">فترات سنة {selectedYear.year}</h3>
            <button onClick={() => setSelectedYear(null)} className="text-slate-500 hover:text-slate-700">إغلاق</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الفترة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ البداية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ النهاية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedYear.periods?.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{period.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{period.start_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{period.end_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${period.is_closed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {period.is_closed ? 'مغلقة' : 'مفتوحة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => toggleClosePeriod(period)} className={period.is_closed ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}>
                        {period.is_closed ? 'فتح' : 'إغلاق'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingYear ? 'تعديل سنة مالية' : 'إضافة سنة مالية'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                year: Number(formData.get('year')),
                start_date: formData.get('start_date') as string,
                end_date: formData.get('end_date') as string,
                is_closed: formData.get('is_closed') === 'on',
              }
              const action = editingYear
                ? api.put(`/fiscal-years/${editingYear.id}`, data)
                : api.post('/fiscal-years', data)
              action.then(() => {
                toast.success(editingYear ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/fiscal-years').then((res) => setYears(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">السنة</label>
                <input name="year" type="number" defaultValue={editingYear?.year || new Date().getFullYear()} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية</label>
                <input name="start_date" type="date" defaultValue={editingYear?.start_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                <input name="end_date" type="date" defaultValue={editingYear?.end_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_closed" type="checkbox" defaultChecked={editingYear?.is_closed || false} className="rounded" />
                <label className="text-sm text-slate-700">مغلقة</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
