import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Fund } from '../types'
import toast from 'react-hot-toast'

const fundTypeLabels: Record<string, string> = {
  unrestricted: 'عام / غير مقيد',
  restricted: 'مقيد',
  temporarily_restricted: 'مقيد مؤقتاً',
  permanently_restricted: 'مقيد دائم',
}

export default function Funds() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingFund, setEditingFund] = useState<Fund | null>(null)

  useEffect(() => {
    api.get('/funds').then((res) => setFunds(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/funds/${id}`)
      toast.success('تم الحذف بنجاح')
      setFunds(funds.filter((f) => f.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (fund?: Fund) => {
    setEditingFund(fund || null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الصناديق والاحتياطيات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          <Plus size={20} />
          إضافة صندوق
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {funds.map((fund) => (
              <tr key={fund.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{fund.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{fund.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{fundTypeLabels[fund.fund_type] || fund.fund_type}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fund.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {fund.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(fund)} className="text-blue-600 hover:text-blue-800 ml-2" title="تعديل">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(fund.id)} className="text-red-600 hover:text-red-800" title="حذف">
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
            <h2 className="text-xl font-bold mb-4">{editingFund ? 'تعديل بيانات الصندوق' : 'إضافة صندوق جديد'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                fund_type: formData.get('fund_type') as string,
                description: formData.get('description') as string || '',
                is_active: formData.get('is_active') === 'on',
              }
              const action = editingFund
                ? api.put(`/funds/${editingFund.id}`, data)
                : api.post('/funds', data)
              action.then(() => {
                toast.success(editingFund ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/funds').then((res) => setFunds(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كود الصندوق</label>
                <input name="code" defaultValue={editingFund?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الصندوق</label>
                <input name="name" defaultValue={editingFund?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">النوع</label>
                <select name="fund_type" defaultValue={editingFund?.fund_type || 'restricted'} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="unrestricted">عام / غير مقيد</option>
                  <option value="restricted">مقيد</option>
                  <option value="temporarily_restricted">مقيد مؤقتاً</option>
                  <option value="permanently_restricted">مقيد بشكل دائم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea name="description" defaultValue={editingFund?.description} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingFund?.is_active ?? true} className="rounded" />
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
