import { useEffect, useState } from 'react'
import api from '../services/api'
import { AuditLog } from '../types'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit-logs').then((res) => {
      setLogs(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">سجل المراجعة</h1>
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">العملية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الجدول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(log.created_at).toLocaleString('ar-EG')}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.user?.username || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.table_name}</td>
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
