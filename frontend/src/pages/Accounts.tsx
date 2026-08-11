import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import { Account } from '../types'

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts')
      setAccounts(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/accounts/${id}`)
      setAccounts(accounts.filter((a) => a.id !== id))
    } catch (error: any) {
      alert(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const filteredAccounts = accounts.filter(
    (a) => a.name.includes(search) || a.code.includes(search)
  )

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">شجرة الحسابات</h1>
        <button onClick={() => { setEditingAccount(null); setShowModal(true) }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة حساب
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المستوى</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">نوع الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{account.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{account.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{account.level}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{account.account_type_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {account.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => { setEditingAccount(account); setShowModal(true) }} className="text-blue-600 hover:text-blue-800 ml-2">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(account.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingAccount ? 'تعديل حساب' : 'إضافة حساب'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); fetchAccounts() }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كود الحساب</label>
                <input type="text" defaultValue={editingAccount?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الحساب</label>
                <input type="text" defaultValue={editingAccount?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
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
