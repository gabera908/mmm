import { useEffect, useState } from 'react'
import api from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Users, PieChart as PieChartIcon } from 'lucide-react'

interface DashboardData {
  total_assets: number
  total_liabilities: number
  total_net_assets: number
  total_revenue: number
  total_expenses: number
  total_donations: number
  projects_count: number
  donors_count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64">جاري التحميل...</div>
  if (!data) return <div>خطأ في تحميل البيانات</div>

  const cards = [
    { title: 'إجمالي الأصول', value: data.total_assets, icon: Wallet, color: 'bg-blue-500' },
    { title: 'الإيرادات', value: data.total_revenue, icon: TrendingUp, color: 'bg-green-500' },
    { title: 'التبرعات', value: data.total_donations, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'المشاريع', value: data.projects_count, icon: PieChartIcon, color: 'bg-orange-500' },
    { title: 'المانحون', value: data.donors_count, icon: Users, color: 'bg-teal-500' },
  ]

  const chartData = [
    { name: 'الأصول', value: data.total_assets },
    { name: 'الخصوم', value: data.total_liabilities },
    { name: 'صافي الأصول', value: data.total_net_assets },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                  <Icon className={`text-${card.color.replace('bg-', '')}`} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">الموقف المالي</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">ملخص مالي</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>إجمالي الإيرادات</span>
              <span className="font-bold text-green-600">{data.total_revenue.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>إجمالي المصروفات</span>
              <span className="font-bold text-red-600">{data.total_expenses.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>صافي الدخل</span>
              <span className="font-bold text-blue-600">{(data.total_revenue - data.total_expenses).toLocaleString()} EGP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
