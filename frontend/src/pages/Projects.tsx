import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Project } from '../types'
import toast from 'react-hot-toast'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [funds, setFunds] = useState<any[]>([])
  const [donors, setDonors] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, fundsRes, donorsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/funds'),
          api.get('/donors'),
        ])
        setProjects(projectsRes.data)
        setFunds(fundsRes.data)
        setDonors(donorsRes.data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
      }
    }
    loadData()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('تم الحذف بنجاح')
      setProjects(projects.filter((p) => p.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (project?: Project) => {
    setEditingProject(project || null)
    setShowModal(true)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'closed': return 'مغلق'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">المشاريع</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة مشروع
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الوصف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Fund</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المانح</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الميزانية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ البداية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">تاريخ النهاية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.description}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{funds.find((f) => f.id === project.fund_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{donors.find((d) => d.id === project.donor_id)?.name || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.budget?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.start_date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.end_date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => openModal(project)} className="text-blue-600 hover:text-blue-800 ml-2">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingProject ? 'تعديل مشروع' : 'إضافة مشروع'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string || '',
                fund_id: Number(formData.get('fund_id')),
                donor_id: Number(formData.get('donor_id')),
                budget: Number(formData.get('budget')) || 0,
                start_date: formData.get('start_date') as string,
                end_date: formData.get('end_date') as string,
                status: formData.get('status') as string,
              }
              const action = editingProject
                ? api.put(`/projects/${editingProject.id}`, data)
                : api.post('/projects', data)
              action.then(() => {
                toast.success(editingProject ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/projects').then((res) => setProjects(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كود المشروع</label>
                <input name="code" defaultValue={editingProject?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المشروع</label>
                <input name="name" defaultValue={editingProject?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea name="description" defaultValue={editingProject?.description} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fund</label>
                <select name="fund_id" defaultValue={editingProject?.fund_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المانح</label>
                <select name="donor_id" defaultValue={editingProject?.donor_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">اختر</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الميزانية</label>
                <input name="budget" type="number" step="0.01" defaultValue={editingProject?.budget || 0} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية</label>
                  <input name="start_date" type="date" defaultValue={editingProject?.start_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                  <input name="end_date" type="date" defaultValue={editingProject?.end_date} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select name="status" defaultValue={editingProject?.status || 'draft'} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="draft">مسودة</option>
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل</option>
                  <option value="closed">مغلق</option>
                </select>
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
