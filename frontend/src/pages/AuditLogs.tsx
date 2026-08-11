import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search } from 'lucide-react'
import { AuditLog } from '../types'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/audit-logs').then((res) => {
      setLogs(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredLogs = logs.filter(
    (log) => log.action?.includes(search) || log.table_name?.includes(search) || log.user?.username?.includes(search)
  )

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">سجل المراجعة</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالعملية أو الجدول أو المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ والوقت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">العملية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الجدول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">رقم السجل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">عنوان IP</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">القيمة القديمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">القيمة الجديدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(log.created_at).toLocaleString('ar-EG')}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.user?.username || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.table_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.record_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.ip_address}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono text-xs max-w-xs truncate">{log.old_value}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono text-xs max-w-xs truncate">{log.new_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
