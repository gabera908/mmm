import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useApiWithFallback } from '../../hooks/useApiWithFallback'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function SettingsFiscalYears() {
  const { data: fiscalYears, loading, setData: setFiscalYears } = useApiWithFallback<any>('/fiscal-years', 'fiscalYears')
  const [showModal, setShowModal] = useState(false)
  const [editingFiscalYear, setEditingFiscalYear] = useState<any | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/fiscal-years/${id}`)
      toast.success('تم الحذف بنجاح')
      setFiscalYears(prev => prev.filter((fy: any) => fy.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (fiscalYear?: any) => {
    setEditingFiscalYear(fiscalYear || null)
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">جارٍ التحميل...</div>
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">السنوات المالية</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة سنة مالية
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم / السنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ البداية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ النهاية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fiscalYears.map((fy: any) => (
              <tr key={fy.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{fy.name || fy.year}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{fy.start_date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{fy.end_date}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(fy)} className="text-blue-600 hover:text-blue-800 ml-2">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(fy.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingFiscalYear ? 'تعديل سنة مالية' : 'إضافة سنة مالية'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const nameVal = formData.get('name') as string
              const startDate = formData.get('start_date') as string
              const endDate = formData.get('end_date') as string
              const yearVal = parseInt(nameVal) || (startDate ? new Date(startDate).getFullYear() : new Date().getFullYear())

              const data = {
                year: yearVal,
                name: nameVal,
                start_date: startDate,
                end_date: endDate,
                is_closed: formData.get('is_closed') === 'on'
              }
              const action = editingFiscalYear
                ? api.put(`/fiscal-years/${editingFiscalYear.id}`, data)
                : api.post('/fiscal-years', data)
              action.then(() => {
                toast.success(editingFiscalYear ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/fiscal-years').then(res => setFiscalYears(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم / السنة</label>
                <input name="name" defaultValue={editingFiscalYear?.name || editingFiscalYear?.year} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية</label>
                <input name="start_date" type="date" defaultValue={editingFiscalYear?.start_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                <input name="end_date" type="date" defaultValue={editingFiscalYear?.end_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_closed" type="checkbox" defaultChecked={editingFiscalYear?.is_closed ?? false} className="rounded" />
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
