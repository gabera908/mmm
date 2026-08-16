import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useApiWithFallback } from '../../hooks/useApiWithFallback'
import { User } from '../../types'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function SettingsUsers() {
  const { data: users, loading, setData: setUsers } = useApiWithFallback<User>('/users', 'users')
  const { data: roles } = useApiWithFallback<any>('/roles', 'roles')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('تم الحذف بنجاح')
      setUsers(prev => prev.filter((u) => u.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (user?: User) => {
    setEditingUser(user || null)
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">جارٍ التحميل...</div>
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">المستخدمون</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة مستخدم
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">اسم المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم الكامل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البريد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الدور</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.role?.name || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 ml-2">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const passwordVal = formData.get('password') as string
              const roleIdVal = formData.get('role_id')
              const data: any = {
                username: formData.get('username') as string,
                full_name: formData.get('full_name') as string,
                email: formData.get('email') as string,
                role_id: roleIdVal ? Number(roleIdVal) : undefined,
                is_active: formData.get('is_active') === 'on',
                is_superuser: formData.get('is_superuser') === 'on',
                must_change_password: formData.get('must_change_password') === 'on',
              }
              if (passwordVal) {
                data.password = passwordVal
              }
              const action = editingUser
                ? api.put(`/users/${editingUser.id}`, data)
                : api.post('/users', data)
              action.then(() => {
                toast.success(editingUser ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/users').then(res => setUsers(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم</label>
                <input name="username" defaultValue={editingUser?.username} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
                <input name="full_name" defaultValue={editingUser?.full_name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد</label>
                <input name="email" type="email" defaultValue={editingUser?.email} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                <input name="password" type="password" placeholder={editingUser ? 'اتركه فارغاً للحفاظ على القديمة' : ''} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الدور</label>
                <select name="role_id" defaultValue={editingUser?.role_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingUser?.is_active ?? true} className="rounded" />
                <label className="text-sm text-slate-700">نشط</label>
              </div>
              <div className="flex items-center gap-2">
                <input name="is_superuser" type="checkbox" defaultChecked={editingUser?.is_superuser || false} className="rounded" />
                <label className="text-sm text-slate-700">مدير</label>
              </div>
              <div className="flex items-center gap-2">
                <input name="must_change_password" type="checkbox" defaultChecked={editingUser?.must_change_password || false} className="rounded" />
                <label className="text-sm text-slate-700">يجب تغيير كلمة المرور</label>
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
