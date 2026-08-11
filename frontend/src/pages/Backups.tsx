import { useEffect, useState } from 'react'
import api from '../services/api'
import { Download, Upload, Trash2 } from 'lucide-react'
import { BackupRecord } from '../types'
import toast from 'react-hot-toast'

export default function Backups() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  const [frequency, setFrequency] = useState('daily')

  useEffect(() => {
    api.get('/backups').then((res) => {
      setBackups(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
    api.get('/settings').then((res) => {
      setAutoBackup(res.data.auto_backup || false)
      setFrequency(res.data.auto_backup_frequency || 'daily')
    }).catch(() => {})
  }, [])

  const handleBackup = async () => {
    try {
      await api.post('/backups')
      toast.success('تم إنشاء النسخة الاحتياطية بنجاح')
      api.get('/backups').then((res) => setBackups(res.data))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في إنشاء النسخة الاحتياطية')
    }
  }

  const handleRestore = async (filename: string) => {
    if (!confirm(`هل أنت متأكد من استعادة النسخة ${filename}؟ سيتم فقدان البيانات الحالية.`)) return
    try {
      await api.post('/backups/restore', { filename })
      toast.success('تم الاستعادة بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الاستعادة')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه النسخة؟')) return
    try {
      await api.delete(`/backups/${id}`)
      toast.success('تم الحذف بنجاح')
      setBackups(backups.filter((b) => b.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const handleAutoBackupChange = () => {
    api.put('/settings', { auto_backup: !autoBackup, auto_backup_frequency: frequency }).then(() => {
      setAutoBackup(!autoBackup)
      toast.success('تم تحديث الإعدادات')
    }).catch((error: any) => {
      toast.error(error.response?.data?.detail || 'خطأ')
    })
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

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">إعدادات النسخ الاحتياطي التلقائي</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={handleAutoBackupChange}
              className="rounded"
            />
            <label className="text-sm text-slate-700">تفعيل النسخ الاحتياطي التلقائي</label>
          </div>
          {autoBackup && (
            <select value={frequency} onChange={(e) => { setFrequency(e.target.value); handleAutoBackupChange() }} className="px-3 py-2 border border-slate-300 rounded-md">
              <option value="daily">يومياً</option>
              <option value="weekly">أسبوعياً</option>
              <option value="monthly">شهرياً</option>
            </select>
          )}
        </div>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{backup.filename}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{(backup.file_size / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{backup.backup_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(backup.created_at).toLocaleString('ar-EG')}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button onClick={() => handleRestore(backup.filename)} className="text-green-600 hover:text-green-800" title="استعادة">
                        <Upload size={16} />
                      </button>
                      <button onClick={() => handleDelete(backup.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {backups.length === 0 && (
              <div className="p-8 text-center text-slate-500">لا توجد نسخ احتياطية</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
