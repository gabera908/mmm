import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { CostCenter } from '../types'
import toast from 'react-hot-toast'

export default function CostCenters() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null)
  const [funds, setFunds] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [centersRes, fundsRes] = await Promise.all([
          api.get('/cost-centers'),
          api.get('/funds'),
        ])
        setCostCenters(centersRes.data)
        setFunds(fundsRes.data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
      }
    }
    loadData()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/cost-centers/${id}`)
      toast.success('تم الحذف بنجاح')
      setCostCenters(costCenters.filter((c) => c.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (costCenter?: CostCenter) => {
    setEditingCostCenter(costCenter || null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">مراكز التكلفة</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة مركز تكلفة
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الوصف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Fund</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {costCenters.map((costCenter) => (
              <tr key={costCenter.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{costCenter.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{costCenter.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{costCenter.description}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{funds.find((f) => f.id === costCenter.fund_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${costCenter.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {costCenter.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(costCenter)} className="text-blue-600 hover:text-blue-800 ml-2">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => handleDelete(costCenter.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingCostCenter ? 'تعديل مركز تكلفة' : 'إضافة مركز تكلفة'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string || '',
                fund_id: Number(formData.get('fund_id')),
                is_active: formData.get('is_active') === 'on',
              }
              const action = editingCostCenter
                ? api.put(`/cost-centers/${editingCostCenter.id}`, data)
                : api.post('/cost-centers', data)
              action.then(() => {
                toast.success(editingCostCenter ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/cost-centers').then((res) => setCostCenters(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كود المركز</label>
                <input name="code" defaultValue={editingCostCenter?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المركز</label>
                <input name="name" defaultValue={editingCostCenter?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea name="description" defaultValue={editingCostCenter?.description} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fund</label>
                <select name="fund_id" defaultValue={editingCostCenter?.fund_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingCostCenter?.is_active ?? true} className="rounded" />
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
