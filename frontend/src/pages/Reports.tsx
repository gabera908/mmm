import { useState } from 'react'
import { FileText, Download } from 'lucide-react'

export default function Reports() {
  const [reportType, setReportType] = useState('trial_balance')

  const reports = [
    { id: 'trial_balance', label: 'ميزان المراجعة' },
    { id: 'general_ledger', label: 'الأستاذ العام' },
    { id: 'income_statement', label: 'قائمة الدخل' },
    { id: 'balance_sheet', label: 'قائمة المركز المالي' },
    { id: 'cash_flow', label: 'قائمة التدفقات النقدية' },
    { id: 'budget_vs_actual', label: 'الموازنة مقابل الفعلي' },
    { id: 'funds', label: 'تقرير Funds' },
    { id: 'projects', label: 'تقرير المشاريع' },
    { id: 'donors', label: 'تقرير المانحين' },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">التقارير</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نوع التقرير</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">من تاريخ</label>
            <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">إلى تاريخ</label>
            <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <FileText size={20} />
            عرض التقرير
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            تصدير PDF
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
            <Download size={20} />
            تصدير Excel
          </button>
        </div>
      </div>
    </div>
  )
}
