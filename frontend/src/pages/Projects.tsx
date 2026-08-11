import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Project } from '../types'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await api.delete(`/projects/${id}`)
    setProjects(projects.filter((p) => p.id !== id))
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">المشاريع</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
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
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الميزانية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{project.budget?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800">
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
