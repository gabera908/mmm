import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Search, Check, X, RefreshCw } from 'lucide-react'
import { JournalEntry } from '../types'

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journals')
      setEntries(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (id: number) => {
    try {
      await api.post(`/journals/${id}/post`)
      fetchEntries()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'خطأ في ترحيل القيد')
    }
  }

  const handleReverse = async (id: number) => {
    try {
      await api.post(`/journals/${id}/reverse`)
      fetchEntries()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'خطأ في عكس القيد')
    }
  }

  const filteredEntries = entries.filter(
    (e) => e.description?.includes(search) || e.entry_number.includes(search)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'posted': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'reversed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'posted': return 'مرحل'
      case 'cancelled': return 'ملغى'
      case 'reversed': return 'معكوس'
      default: return status
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">القيود اليومية</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة قيد
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">رقم القيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البيان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.entry_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {entry.status === 'draft' && (
                        <button onClick={() => handlePost(entry.id)} className="text-green-600 hover:text-green-800 ml-2" title="ترحيل">
                          <Check size={16} />
                        </button>
                      )}
                      {entry.status === 'posted' && (
                        <button onClick={() => handleReverse(entry.id)} className="text-orange-600 hover:text-orange-800 ml-2" title="عكس">
                          <RefreshCw size={16} />
                        </button>
                      )}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">إضافة قيد يومي</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); fetchEntries(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البيان</label>
                <textarea className="w-full px-3 py-2 border border-slate-300 rounded-md" rows={2} />
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
