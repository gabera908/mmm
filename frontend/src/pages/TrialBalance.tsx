import { useEffect, useState } from 'react'
import api from '../services/api'

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

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">ميزان المراجعة</h1>
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
                  <td className="px-6 py-4 text-sm text-green-600">{row.debit.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-600">{row.credit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-slate-900">الإجمالي</td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">{data?.total_debit?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-red-600">{data?.total_credit?.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
