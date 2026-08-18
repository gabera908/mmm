import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useApiWithFallback } from '../../hooks/useApiWithFallback'
import toast from 'react-hot-toast'
import api from '../../services/api'

const roleNameLabels: Record<string, string> = {
  Administrator: 'مدير النظام',
  Accountant: 'محاسب رئيسي',
  Viewer: 'مستعرض البيانات',
}

const permissionLabels: Record<string, string> = {
  '*': 'جميع الصلاحيات (مدير)',
  view_accounts: 'عرض الحسابات',
  create_journals: 'إضافة القيود اليومية',
  view_reports: 'عرض التقارير',
  manage_donations: 'إدارة التبرعات',
  manage_projects: 'إدارة المشاريع',
  view_journals: 'استعراض القيود',
}

export default function SettingsRoles() {
  const { data: roles, loading, setData: setRoles } = useApiWithFallback<any>('/roles', 'roles')
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/roles/${id}`)
      toast.success('تم الحذف بنجاح')
      setRoles(prev => prev.filter((r: any) => r.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (role?: any) => {
    setEditingRole(role || null)
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">جارٍ التحميل...</div>
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">الأدوار والصلاحيات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          <Plus size={20} />
          إضافة دور جديد
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">اسم الدور</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الوصف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الصلاحيات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role: any) => (
              <tr key={role.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{roleNameLabels[role.name] || role.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{role.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex flex-wrap gap-1">
                    {(typeof role.permissions === 'string' ? role.permissions.split(',') : Array.isArray(role.permissions) ? role.permissions : ['*']).map((p: string, idx: number) => {
                      const trimmed = p.trim()
                      return (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">
                          {permissionLabels[trimmed] || trimmed}
                        </span>
                      )
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(role)} className="text-blue-600 hover:text-blue-800 ml-2" title="تعديل">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-800" title="حذف">
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
            <h2 className="text-xl font-bold mb-4">{editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                permissions: formData.get('permissions') as string || '*',
              }
              const action = editingRole
                ? api.put(`/roles/${editingRole.id}`, data)
                : api.post('/roles', data)
              action.then(() => {
                toast.success(editingRole ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/roles').then(res => setRoles(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الدور</label>
                <input name="name" defaultValue={editingRole?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea name="description" defaultValue={editingRole?.description} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحيات (* للكل أو مفصولة بفاصلة)</label>
                <input name="permissions" defaultValue={editingRole?.permissions} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="*" />
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
