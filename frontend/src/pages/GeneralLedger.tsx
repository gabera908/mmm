import { useEffect, useState } from 'react'
import api from '../services/api'

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
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    api.get('/ledger', { params: { account_id: accountId || undefined } }).then((res) => {
      setLedger(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [accountId])

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">الأستاذ العام</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">رقم الحساب</label>
          <input
            type="number"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
            placeholder="اتركه فارغاً لعرض الكل"
          />
        </div>
        {loading ? (
          <div>جاري التحميل...</div>
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
                    <td className="px-6 py-4 text-sm text-green-600">{row.debit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{row.credit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">{row.balance.toLocaleString()}</td>
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
