import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus } from 'lucide-react'

export default function FiscalYears() {
  const [years, setYears] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/fiscal-years').then((res) => setYears(res.data))
  }, [])

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">السنوات المالية</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus size={20} />
          إضافة سنة
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">السنة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ البداية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ النهاية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {years.map((year) => (
              <tr key={year.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{year.year}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{year.start_date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{year.end_date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${year.is_closed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {year.is_closed ? 'مغلقة' : 'مفتوحة'}
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
