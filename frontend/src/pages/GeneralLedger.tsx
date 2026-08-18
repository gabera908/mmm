import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface LedgerRow {
  date: string
  entry_number: string
  account_code: string
  account_name: string
  debit: number
  credit: number
  balance: number
}

export default function GeneralLedger() {
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    account_id: '',
    fiscal_year_id: '',
    period_id: '',
    fund_id: '',
    project_id: '',
    cost_center_id: '',
    donor_id: '',
  })
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [fiscalYears, setFiscalYears] = useState<any[]>([])
  const [costCenters, setCostCenters] = useState<any[]>([])
  const [donors, setDonors] = useState<any[]>([])

  useEffect(() => {
    api.get('/funds').then((res) => setFunds(res.data)).catch(() => {})
    api.get('/projects').then((res) => setProjects(res.data)).catch(() => {})
    api.get('/fiscal-years').then((res) => setFiscalYears(res.data)).catch(() => {})
    api.get('/cost-centers').then((res) => setCostCenters(res.data)).catch(() => {})
    api.get('/donors').then((res) => setDonors(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params: any = {}
    if (filters.account_id) params.account_id = filters.account_id
    if (filters.fiscal_year_id) params.fiscal_year_id = filters.fiscal_year_id
    if (filters.period_id) params.period_id = filters.period_id
    if (filters.fund_id) params.fund_id = filters.fund_id
    if (filters.project_id) params.project_id = filters.project_id
    if (filters.cost_center_id) params.cost_center_id = filters.cost_center_id
    if (filters.donor_id) params.donor_id = filters.donor_id

    setLoading(true)
    api.get('/ledger', { params }).then((res) => {
      setLedger(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters])

  const handleExportPDF = () => {
    toast.success('جاري تصدير PDF...')
  }

  const handleExportExcel = () => {
    toast.success('جاري تصدير Excel...')
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الأستاذ العام</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            <Download size={20} />
            PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحساب</label>
            <input type="text" value={filters.account_id} onChange={(e) => setFilters({ ...filters, account_id: e.target.value })} placeholder="كود الحساب" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السنة المالية</label>
            <select value={filters.fiscal_year_id} onChange={(e) => setFilters({ ...filters, fiscal_year_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {fiscalYears.map((y) => (
                <option key={y.id} value={y.id}>{y.year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">مركز التكلفة</label>
            <select value={filters.cost_center_id} onChange={(e) => setFilters({ ...filters, cost_center_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {costCenters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المانح</label>
            <select value={filters.donor_id} onChange={(e) => setFilters({ ...filters, donor_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {donors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الفترة</label>
            <select value={filters.period_id} onChange={(e) => setFilters({ ...filters, period_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">رقم القيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">مدين</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">دائن</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledger.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.account_code} - {row.account_name}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{row.debit?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{row.credit?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">{row.balance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ledger.length === 0 && (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
