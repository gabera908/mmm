import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download } from 'lucide-react'
import { BackupRecord } from '../types'

export default function Backups() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/backups').then((res) => {
      setBackups(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleBackup = async () => {
    try {
      await api.post('/backups')
      alert('تم إنشاء النسخة الاحتياطية بنجاح')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'خطأ في إنشاء النسخة الاحتياطية')
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">النسخ الاحتياطي</h1>
        <button onClick={handleBackup} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Download size={20} />
          إنشاء نسخة احتياطية
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الملف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحجم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{backup.filename}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{(backup.file_size / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{backup.backup_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(backup.created_at).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
