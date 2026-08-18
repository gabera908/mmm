import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatAmount } from '../utils/formatters'

interface TrialBalanceRow {
  code: string
  name: string
  debit: number
  credit: number
}

export default function TrialBalance() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trial-balance').then((res) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleExportPDF = () => {
    toast.success('جاري تصدير PDF...')
  }

  const handleExportExcel = () => {
    toast.success('جاري تصدير Excel...')
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div>جاري التحميل...</div>

  const isBalanced = data?.total_debit && data?.total_credit && Math.abs(data.total_debit - data.total_credit) < 0.01

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">ميزان المراجعة</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            <Download size={20} />
            PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700">
            <Printer size={20} />
            طباعة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">كود الحساب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">اسم الحساب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">مدين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">دائن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.accounts?.map((row: TrialBalanceRow, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600 font-mono">{formatAmount(row.debit)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-rose-600 font-mono">{formatAmount(row.credit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-slate-900">الإجمالي</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600 font-mono">{formatAmount(data?.total_debit)}</td>
                <td className="px-6 py-4 text-sm font-bold text-rose-600 font-mono">{formatAmount(data?.total_credit)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm font-bold">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isBalanced ? 'الميزان متوازن' : 'الميزان غير متوازن'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
