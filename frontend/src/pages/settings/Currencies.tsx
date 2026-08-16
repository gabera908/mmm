import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useApiWithFallback } from '../../hooks/useApiWithFallback'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function SettingsCurrencies() {
  const { data: currencies, loading, setData: setCurrencies } = useApiWithFallback<any>('/currencies', 'currencies')
  const [showModal, setShowModal] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<any | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/currencies/${id}`)
      toast.success('تم الحذف بنجاح')
      setCurrencies(prev => prev.filter((c: any) => c.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (currency?: any) => {
    setEditingCurrency(currency || null)
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">جارٍ التحميل...</div>
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">العملات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة عملة
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">سعر الصرف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">أساسية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currencies.map((currency: any) => (
              <tr key={currency.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{currency.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.exchange_rate || currency.symbol || '1.0'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.is_base ? 'نعم' : 'لا'}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(currency)} className="text-blue-600 hover:text-blue-800 ml-2">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(currency.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingCurrency ? 'تعديل عملة' : 'إضافة عملة'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const rateVal = parseFloat(formData.get('exchange_rate') as string)
              const data = {
                name: formData.get('name') as string,
                code: formData.get('code') as string,
                exchange_rate: isNaN(rateVal) ? 1.0 : rateVal,
                is_base: formData.get('is_base') === 'on',
                is_active: formData.get('is_active') === 'on'
              }
              const action = editingCurrency
                ? api.put(`/currencies/${editingCurrency.id}`, data)
                : api.post('/currencies', data)
              action.then(() => {
                toast.success(editingCurrency ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/currencies').then(res => setCurrencies(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                <input name="name" defaultValue={editingCurrency?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الكود</label>
                <input name="code" defaultValue={editingCurrency?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required maxLength={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">سعر الصرف</label>
                <input name="exchange_rate" type="number" step="0.0001" defaultValue={editingCurrency?.exchange_rate || 1.0} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_base" type="checkbox" defaultChecked={editingCurrency?.is_base ?? false} className="rounded" />
                <label className="text-sm text-slate-700">عملة أساسية</label>
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingCurrency?.is_active ?? true} className="rounded" />
                <label className="text-sm text-slate-700">نشط</label>
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
