import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Budget } from '../types'

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/budgets').then((res) => setBudgets(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await api.delete(`/budgets/${id}`)
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الموازنات</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus size={20} />
          إضافة موازنة
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">السنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الموازنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الفعلية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الفارق</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">نسبة التنفيذ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {budgets.map((budget) => (
              <tr key={budget.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-700">{budget.fiscal_year}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{budget.budget_amount?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{budget.actual_amount?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{(budget.budget_amount - budget.actual_amount)?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {budget.budget_amount ? ((budget.actual_amount / budget.budget_amount) * 100).toFixed(1) : 0}%
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => handleDelete(budget.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
