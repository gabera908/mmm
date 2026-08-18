import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Donation } from '../types'
import toast from 'react-hot-toast'
import { formatAmount } from '../utils/formatters'

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقدي',
  bank_transfer: 'تحويل بنكي',
  check: 'شيك',
  online: 'أونلاين',
  'إيداع نقدي': 'إيداع نقدي',
  'تحويل بنكي': 'تحويل بنكي',
  'شيك بنكي': 'شيك بنكي',
  'بطاقة إلكترونية': 'بطاقة إلكترونية',
}

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [donors, setDonors] = useState<any[]>([])
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [donationsRes, donorsRes, fundsRes, projectsRes] = await Promise.all([
          api.get('/donations'),
          api.get('/donors'),
          api.get('/funds'),
          api.get('/projects'),
        ])
        setDonations(donationsRes.data)
        setDonors(donorsRes.data)
        setFunds(fundsRes.data)
        setProjects(projectsRes.data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
      }
    }
    loadData()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/donations/${id}`)
      toast.success('تم الحذف بنجاح')
      setDonations(donations.filter((d) => d.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (donation?: Donation) => {
    setEditingDonation(donation || null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">التبرعات والمساهمات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          <Plus size={20} />
          إضافة تبرع جديد
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المانح</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المبلغ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">العملة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">طريقة الدفع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الصندوق / الاحتياطي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المشروع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-700">{donation.donation_date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donors.find((d) => d.id === donation.donor_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 font-mono">{formatAmount(donation.amount)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donation.currency}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{paymentMethodLabels[donation.payment_method] || donation.payment_method}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{funds.find((f) => f.id === donation.fund_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{projects.find((p) => p.id === donation.project_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(donation)} className="text-blue-600 hover:text-blue-800 ml-2" title="تعديل">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(donation.id)} className="text-red-600 hover:text-red-800" title="حذف">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingDonation ? 'تعديل بيانات التبرع' : 'تسجيل تبرع جديد'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                donation_date: formData.get('donation_date') as string,
                donor_id: Number(formData.get('donor_id')),
                fund_id: Number(formData.get('fund_id')),
                project_id: Number(formData.get('project_id')) || null,
                amount: Number(formData.get('amount')),
                currency: formData.get('currency') as string,
                payment_method: formData.get('payment_method') as string,
                reference: formData.get('reference') as string || '',
                notes: formData.get('notes') as string || '',
              }
              const action = editingDonation
                ? api.put(`/donations/${editingDonation.id}`, data)
                : api.post('/donations', data)
              action.then(() => {
                toast.success(editingDonation ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/donations').then((res) => setDonations(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التبرع</label>
                <input name="donation_date" type="date" defaultValue={editingDonation?.donation_date || new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المانح / المتبرع</label>
                <select name="donor_id" defaultValue={editingDonation?.donor_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md" required>
                  <option value="">اختر المانح</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
                <select name="fund_id" defaultValue={editingDonation?.fund_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md" required>
                  <option value="">اختر الصندوق</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المشروع (اختياري)</label>
                <select name="project_id" defaultValue={editingDonation?.project_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر المشروع</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ</label>
                <input name="amount" type="number" step="0.01" defaultValue={editingDonation?.amount || 0} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">العملة</label>
                <select name="currency" defaultValue={editingDonation?.currency || 'EGP'} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">طريقة الدفع</label>
                <select name="payment_method" defaultValue={editingDonation?.payment_method || 'cash'} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="cash">نقدي</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="check">شيك بنكي</option>
                  <option value="online">بطاقة / أونلاين</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المرجع / الرقم المرجعي</label>
                <input name="reference" defaultValue={editingDonation?.reference} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea name="notes" defaultValue={editingDonation?.notes} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
