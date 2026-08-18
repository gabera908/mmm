import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2, Search } from 'lucide-react'
import { Budget } from '../types'
import toast from 'react-hot-toast'

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [search, setSearch] = useState('')
  const [fiscalYearFilter, setFiscalYearFilter] = useState('')
  const [fiscalYears, setFiscalYears] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetsRes, yearsRes, accountsRes, fundsRes, projectsRes] = await Promise.all([
          api.get('/budgets'),
          api.get('/fiscal-years'),
          api.get('/accounts'),
          api.get('/funds'),
          api.get('/projects'),
        ])
        setBudgets(budgetsRes.data)
        setFiscalYears(yearsRes.data)
        setAccounts(accountsRes.data)
        setFunds(fundsRes.data)
        setProjects(projectsRes.data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
      }
    }
    loadData()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/budgets/${id}`)
      toast.success('تم الحذف بنجاح')
      setBudgets(budgets.filter((b) => b.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (budget?: Budget) => {
    setEditingBudget(budget || null)
    setShowModal(true)
  }

  const filteredBudgets = budgets.filter((b) => {
    if (fiscalYearFilter && b.fiscal_year.toString() !== fiscalYearFilter) return false
    if (search) {
      const account = accounts.find((a) => a.id === b.account_id)
      if (!account?.name.includes(search) && !account?.code.includes(search)) return false
    }
    return true
  })

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الموازنات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة موازنة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="بحث بالحساب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-md"
          />
        </div>
        <select
          value={fiscalYearFilter}
          onChange={(e) => setFiscalYearFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md"
        >
          <option value="">كل السنوات</option>
          {fiscalYears.map((y) => (
            <option key={y.id} value={y.year}>{y.year}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">السنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحساب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الصندوق / الاحتياطي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المشروع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الموازنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الفعلية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الفارق</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">نسبة التنفيذ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredBudgets.map((budget) => {
              const account = accounts.find((a) => a.id === budget.account_id)
              const fund = funds.find((f) => f.id === budget.fund_id)
              const project = projects.find((p) => p.id === budget.project_id)
              const variance = (budget.budget_amount || 0) - (budget.actual_amount || 0)
              const execution = budget.budget_amount ? ((budget.actual_amount / budget.budget_amount) * 100) : 0
              return (
                <tr key={budget.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">{budget.fiscal_year}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{account?.code} - {account?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{fund?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{project?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{budget.budget_amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{budget.actual_amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{variance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${execution > 100 ? 'bg-red-100 text-red-800' : execution > 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {execution.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => openModal(budget)} className="text-blue-600 hover:text-blue-800 ml-2">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingBudget ? 'تعديل موازنة' : 'إضافة موازنة'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                fiscal_year: Number(formData.get('fiscal_year')),
                account_id: Number(formData.get('account_id')),
                fund_id: Number(formData.get('fund_id')),
                project_id: Number(formData.get('project_id')) || null,
                budget_amount: Number(formData.get('budget_amount')),
                actual_amount: Number(formData.get('actual_amount')) || 0,
                notes: formData.get('notes') as string || '',
              }
              const action = editingBudget
                ? api.put(`/budgets/${editingBudget.id}`, data)
                : api.post('/budgets', data)
              action.then(() => {
                toast.success(editingBudget ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/budgets').then((res) => setBudgets(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">السنة المالية</label>
                <select name="fiscal_year" defaultValue={editingBudget?.fiscal_year || fiscalYears[0]?.year} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  {fiscalYears.map((y) => (
                    <option key={y.id} value={y.year}>{y.year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحساب</label>
                <select name="account_id" defaultValue={editingBudget?.account_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
                <select name="fund_id" defaultValue={editingBudget?.fund_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المشروع</label>
                <select name="project_id" defaultValue={editingBudget?.project_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">مبلغ الموازنة</label>
                <input name="budget_amount" type="number" step="0.01" defaultValue={editingBudget?.budget_amount || 0} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ الفعلي</label>
                <input name="actual_amount" type="number" step="0.01" defaultValue={editingBudget?.actual_amount || 0} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea name="notes" defaultValue={editingBudget?.notes} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
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
