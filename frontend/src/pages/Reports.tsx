import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const reportTypes = [
  { id: 'trial_balance', label: 'ميزان المراجعة' },
  { id: 'balance_sheet', label: 'قائمة المركز المالي' },
  { id: 'income_statement', label: 'قائمة الأنشطة' },
  { id: 'cash_flow', label: 'قائمة التدفقات النقدية' },
  { id: 'general_ledger', label: 'الأستاذ العام' },
  { id: 'account_statement', label: 'كشف حساب' },
  { id: 'budget_vs_actual', label: 'الموازنة مقابل الفعلي' },
  { id: 'funds', label: 'تقرير الصناديق والاحتياطيات' },
  { id: 'projects', label: 'تقرير المشاريع' },
  { id: 'donors', label: 'تقرير المانحين' },
  { id: 'revenue', label: 'تقرير الإيرادات' },
  { id: 'expenses', label: 'تقرير المصروفات' },
]

export default function Reports() {
  const [reportType, setReportType] = useState('trial_balance')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [fundId, setFundId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/funds').then((res) => setFunds(res.data)).catch(() => {})
    api.get('/projects').then((res) => setProjects(res.data)).catch(() => {})
  }, [])

  const handleGenerate = () => {
    setLoading(true)
    const params: any = { report_type: reportType }
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (fundId) params.fund_id = fundId
    if (projectId) params.project_id = projectId
    if (accountId) params.account_id = accountId

    api.get('/reports', { params }).then((res) => {
      setReportData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleExportPDF = () => {
    const params = new URLSearchParams()
    params.append('report_type', reportType)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    if (fundId) params.append('fund_id', fundId)
    if (projectId) params.append('project_id', projectId)
    if (accountId) params.append('account_id', accountId)
    window.open(`/api/reports/export/pdf?${params.toString()}`, '_blank')
    toast.success('جاري تصدير PDF...')
  }

  const handleExportExcel = () => {
    const params = new URLSearchParams()
    params.append('report_type', reportType)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    if (fundId) params.append('fund_id', fundId)
    if (projectId) params.append('project_id', projectId)
    if (accountId) params.append('account_id', accountId)
    window.open(`/api/reports/export/excel?${params.toString()}`, '_blank')
    toast.success('جاري تصدير Excel...')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">التقارير</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">إعدادات التقرير</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع التقرير</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              {reportTypes.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">من تاريخ</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">إلى تاريخ</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
            <select value={fundId} onChange={(e) => setFundId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المشروع</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحساب</label>
            <input type="text" value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="كود الحساب" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            <Filter size={20} />
            {loading ? 'جاري التحميل...' : 'عرض التقرير'}
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            <Download size={20} />
            تصدير PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            تصدير Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700">
            طباعة
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">{reportTypes.find((r) => r.id === reportType)?.label}</h2>
            <p className="text-sm text-slate-500">من {dateFrom || 'البداية'} إلى {dateTo || 'النهاية'}</p>
          </div>
          <div className="overflow-x-auto">
            {reportData.accounts && (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">مدين</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">دائن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.accounts.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-green-600">{row.debit?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-red-600">{row.credit?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-slate-900">الإجمالي</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">{reportData.total_debit?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{reportData.total_credit?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            )}
            {!reportData.accounts && (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
