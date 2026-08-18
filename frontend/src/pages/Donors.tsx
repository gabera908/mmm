import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2, Eye, Edit } from 'lucide-react'
import { Donor } from '../types'
import toast from 'react-hot-toast'

const donorTypeLabels: Record<string, string> = {
  individual: 'فرد',
  company: 'شركة',
  organization: 'مؤسسة',
  'فرد': 'فرد',
  'شركة': 'شركة',
  'مؤسسة': 'مؤسسة',
  'فاعل خير': 'فاعل خير',
}

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null)

  useEffect(() => {
    api.get('/donors').then((res) => setDonors(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/donors/${id}`)
      toast.success('تم الحذف بنجاح')
      setDonors(donors.filter((d) => d.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (donor?: Donor) => {
    setEditingDonor(donor || null)
    setShowModal(true)
  }

  const viewDonor = async (donor: Donor) => {
    setViewingDonor(donor)
    try {
      const res = await api.get(`/donors/${donor.id}/donations`)
      setDonations(res.data)
    } catch {
      setDonations([])
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">المانحون والمتبرعون</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          <Plus size={20} />
          إضافة مانح جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الهاتف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البريد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {donors.map((donor) => (
              <tr key={donor.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{donor.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donorTypeLabels[donor.donor_type] || donor.donor_type}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donor.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donor.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${donor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {donor.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button onClick={() => viewDonor(donor)} className="text-blue-600 hover:text-blue-800" title="عرض السجل">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => openModal(donor)} className="text-blue-600 hover:text-blue-800 ml-2" title="تعديل">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(donor.id)} className="text-red-600 hover:text-red-800" title="حذف">
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
            <h2 className="text-xl font-bold mb-4">{editingDonor ? 'تعديل بيانات المانح' : 'إضافة مانح جديد'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                name: formData.get('name') as string,
                donor_type: formData.get('donor_type') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                address: formData.get('address') as string,
                notes: formData.get('notes') as string || '',
                is_active: formData.get('is_active') === 'on',
              }
              const action = editingDonor
                ? api.put(`/donors/${editingDonor.id}`, data)
                : api.post('/donors', data)
              action.then(() => {
                toast.success(editingDonor ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/donors').then((res) => setDonors(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المانح / الجهة</label>
                <input name="name" defaultValue={editingDonor?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">النوع</label>
                <select name="donor_type" defaultValue={editingDonor?.donor_type || 'individual'} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="individual">فرد</option>
                  <option value="company">شركة</option>
                  <option value="organization">مؤسسة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
                <input name="phone" defaultValue={editingDonor?.phone} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                <input name="email" type="email" defaultValue={editingDonor?.email} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                <input name="address" defaultValue={editingDonor?.address} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea name="notes" defaultValue={editingDonor?.notes} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingDonor?.is_active ?? true} className="rounded" />
                <label className="text-sm text-slate-700">نشط</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">تفاصيل المانح: {viewingDonor.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><span className="text-sm text-slate-500">النوع:</span> {donorTypeLabels[viewingDonor.donor_type] || viewingDonor.donor_type}</div>
              <div><span className="text-sm text-slate-500">الهاتف:</span> {viewingDonor.phone}</div>
              <div><span className="text-sm text-slate-500">البريد:</span> {viewingDonor.email}</div>
              <div><span className="text-sm text-slate-500">العنوان:</span> {viewingDonor.address}</div>
            </div>
            <h3 className="font-semibold mb-2">سجل التبرعات</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">المبلغ</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">طريقة الدفع</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">المشروع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 text-sm">{d.donation_date}</td>
                      <td className="px-4 py-3 text-sm">{d.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{d.payment_method}</td>
                      <td className="px-4 py-3 text-sm">{d.project?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {donations.length === 0 && (
                <div className="p-4 text-center text-slate-500">لا توجد تبرعات مسجلة لهذا المانح</div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewingDonor(null)} className="px-4 py-2 border border-slate-300 rounded-md">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
