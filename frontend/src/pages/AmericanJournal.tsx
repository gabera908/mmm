import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download, Filter } from 'lucide-react'
import { AmericanJournalRow } from '../types'
import toast from 'react-hot-toast'

export default function AmericanJournal() {
  const [rows, setRows] = useState<AmericanJournalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    account_id: '',
    fund_id: '',
    project_id: '',
  })
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    api.get('/funds').then((res) => setFunds(res.data)).catch(() => {})
    api.get('/projects').then((res) => setProjects(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params: any = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.account_id) params.account_id = filters.account_id
    if (filters.fund_id) params.fund_id = filters.fund_id
    if (filters.project_id) params.project_id = filters.project_id

    setLoading(true)
    api.get('/reports/american-journal', { params }).then((res) => {
      setRows(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters])

  const handleExportPDF = () => {
    toast.success('جاري تصدير PDF...')
  }

  const handleExportExcel = () => {
    toast.success('جاري تصدير Excel...')
  }

  if (loading) return <div className="flex items-center justify-center h-64">جاري التحميل...</div>

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">اليومية الأمريكية</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            <Download size={20} />
            تصدير PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            تصدير Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">من تاريخ</label>
            <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">إلى تاريخ</label>
            <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحساب</label>
            <input type="text" value={filters.account_id} onChange={(e) => setFilters({ ...filters, account_id: e.target.value })} placeholder="كود الحساب" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fund</label>
            <select value={filters.fund_id} onChange={(e) => setFilters({ ...filters, fund_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المشروع</label>
            <select value={filters.project_id} onChange={(e) => setFilters({ ...filters, project_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">رقم القيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البيان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">مدين</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">دائن</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.account_code} - {row.account_name}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{row.debit?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{row.credit?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">{row.balance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
