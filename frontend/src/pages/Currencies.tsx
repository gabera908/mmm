import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus } from 'lucide-react'
import { Currency } from '../types'

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/currencies').then((res) => setCurrencies(res.data))
  }, [])

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">العملات</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus size={20} />
          إضافة عملة
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الرمز</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">أساسية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{currency.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.symbol}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${currency.is_base ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {currency.is_base ? 'أساسية' : 'ثانوية'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
