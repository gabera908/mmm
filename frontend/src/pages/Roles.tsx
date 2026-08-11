import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Role } from '../types'

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/roles').then((res) => setRoles(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await api.delete(`/roles/${id}`)
    setRoles(roles.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الصلاحيات</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus size={20} />
          إضافة دور
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الوصف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{role.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{role.description}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-800">
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
