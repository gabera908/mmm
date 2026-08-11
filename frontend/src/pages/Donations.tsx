import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Donation } from '../types'

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/donations').then((res) => setDonations(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await api.delete(`/donations/${id}`)
    setDonations(donations.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">التبرعات</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus size={20} />
          إضافة تبرع
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المبلغ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">طريقة الدفع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-700">{donation.donation_date}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{donation.amount?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donation.payment_method}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => handleDelete(donation.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
