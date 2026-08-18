import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Users, PieChart as PieChartIcon, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    fiscal_year_id: '',
    month: '',
    fund_id: '',
    project_id: '',
  })
  const [funds, setFunds] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [fiscalYears, setFiscalYears] = useState<any[]>([])

  useEffect(() => {
    api.get('/funds').then((res) => setFunds(res.data)).catch(() => {})
    api.get('/projects').then((res) => setProjects(res.data)).catch(() => {})
    api.get('/fiscal-years').then((res) => setFiscalYears(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params: any = {}
    if (filters.fiscal_year_id) params.fiscal_year_id = filters.fiscal_year_id
    if (filters.month) params.month = filters.month
    if (filters.fund_id) params.fund_id = filters.fund_id
    if (filters.project_id) params.project_id = filters.project_id

    setLoading(true)
    api.get('/reports/dashboard', { params }).then((res) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters])

  const chartData = useMemo(() => {
    if (!data) return []
    return [
      { name: 'الأصول', value: data.total_assets },
      { name: 'الخصوم', value: data.total_liabilities },
      { name: 'صافي الأصول', value: data.total_net_assets },
    ]
  }, [data])

  const revenueExpenseData = useMemo(() => {
    if (!data) return []
    return [
      { name: 'الإيرادات', value: data.total_revenue },
      { name: 'المصروفات', value: data.total_expenses },
    ]
  }, [data])

  const handleExport = () => {
    toast.success('جاري تصدير التقرير...')
  }

  if (loading && !data) return <div className="flex items-center justify-center h-64">جاري التحميل...</div>
  if (!data) return <div className="flex items-center justify-center h-64 text-red-600">خطأ في تحميل البيانات</div>

  const cards = [
    { title: 'إجمالي الأصول', value: data.total_assets, icon: Wallet, color: 'bg-blue-500' },
    { title: 'إجمالي الالتزامات', value: data.total_liabilities, icon: Wallet, color: 'bg-red-500' },
    { title: 'صافي الأصول', value: data.total_net_assets, icon: PieChartIcon, color: 'bg-purple-500' },
    { title: 'الإيرادات', value: data.total_revenue, icon: TrendingUp, color: 'bg-green-500' },
    { title: 'المصروفات', value: data.total_expenses, icon: TrendingDown, color: 'bg-orange-500' },
    { title: 'التبرعات', value: data.total_donations, icon: TrendingUp, color: 'bg-teal-500' },
    { title: 'المشاريع', value: data.projects_count, icon: PieChartIcon, color: 'bg-indigo-500' },
    { title: 'المانحون', value: data.donors_count, icon: Users, color: 'bg-pink-500' },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          <Download size={20} />
          تصدير
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السنة المالية</label>
            <select value={filters.fiscal_year_id} onChange={(e) => setFilters({ ...filters, fiscal_year_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {fiscalYears.map((y) => (
                <option key={y.id} value={y.id}>{y.year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الشهر</label>
            <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
            <select value={filters.fund_id} onChange={(e) => setFilters({ ...filters, fund_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المشروع</label>
            <select value={filters.project_id} onChange={(e) => setFilters({ ...filters, project_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
              <option value="">الكل</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value?.toLocaleString?.() || 0}</p>
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
          <h3 className="text-lg font-semibold mb-4">الإيرادات والمصروفات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenseData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">الموقف المالي</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
