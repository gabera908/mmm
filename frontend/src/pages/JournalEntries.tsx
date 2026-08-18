import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { Plus, Search, Trash2, Edit, Check, X, RefreshCw, Printer, Download } from 'lucide-react'
import { JournalEntry, Account, Fund, Project } from '../types'
import toast from 'react-hot-toast'
import { useForm, useFieldArray } from 'react-hook-form'

interface JournalForm {
  entry_date: string
  description: string
  reference: string
  currency: string
  exchange_rate: number
  fund_id: number
  project_id: number
  cost_center_id: number
  lines: {
    account_id: number
    fund_id: number
    project_id: number
    cost_center_id: number
    debit: number
    credit: number
    description: string
  }[]
}

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fundsList, setFundsList] = useState<Fund[]>([])
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [posting, setPosting] = useState(false)

  const { register, handleSubmit, reset, watch, control, formState: { errors: _errors } } = useForm<JournalForm>({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      currency: 'EGP',
      exchange_rate: 1,
      fund_id: 0,
      project_id: 0,
      cost_center_id: 0,
      lines: [
        { account_id: 0, fund_id: 0, project_id: 0, cost_center_id: 0, debit: 0, credit: 0, description: '' },
        { account_id: 0, fund_id: 0, project_id: 0, cost_center_id: 0, debit: 0, credit: 0, description: '' },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  const watchedLines = watch('lines')

  const totals = useMemo(() => {
    const debit = watchedLines?.reduce((sum, line) => sum + (Number(line.debit) || 0), 0) || 0
    const credit = watchedLines?.reduce((sum, line) => sum + (Number(line.credit) || 0), 0) || 0
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 }
  }, [watchedLines])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [entriesRes, accountsRes, fundsRes, projectsRes] = await Promise.all([
          api.get('/journals'),
          api.get('/accounts'),
          api.get('/funds'),
          api.get('/projects'),
        ])
        setEntries(entriesRes.data)
        setAccounts(accountsRes.data)
        setFundsList(fundsRes.data)
        setProjectsList(projectsRes.data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const openModal = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry)
      reset({
        entry_date: entry.entry_date,
        description: entry.description,
        reference: entry.reference || '',
        currency: entry.currency || 'EGP',
        exchange_rate: entry.exchange_rate || 1,
        fund_id: entry.fund_id || 0,
        project_id: entry.project_id || 0,
        cost_center_id: 0,
        lines:     entry.lines?.map((l) => ({
          account_id: l.account_id,
          fund_id: l.fund_id || 0,
          project_id: l.project_id || 0,
          cost_center_id: (l as any).cost_center_id || 0,
          debit: l.debit,
          credit: l.credit,
          description: l.description || '',
        })) || [],
      })
    } else {
      setEditingEntry(null)
      reset({
        entry_date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        currency: 'EGP',
        exchange_rate: 1,
        fund_id: 0,
        project_id: 0,
        cost_center_id: 0,
        lines: [
          { account_id: 0, fund_id: 0, project_id: 0, cost_center_id: 0, debit: 0, credit: 0, description: '' },
          { account_id: 0, fund_id: 0, project_id: 0, cost_center_id: 0, debit: 0, credit: 0, description: '' },
        ],
      })
    }
    setShowModal(true)
  }

  const onSubmit = (data: JournalForm) => {
    if (!totals.balanced) {
      toast.error('إجمالي المدين يجب أن يساوي إجمالي الدائن')
      return
    }
    const action = editingEntry
      ? api.put(`/journals/${editingEntry.id}`, data)
      : api.post('/journals', data)
    action.then(() => {
      toast.success(editingEntry ? 'تم التحديث بنجاح' : 'تم إنشاء القيد بنجاح')
      setShowModal(false)
      fetchEntries()
    }).catch((error: any) => {
      toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
    })
  }

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journals')
      setEntries(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ')
    }
  }

  const handlePost = async (id: number) => {
    setPosting(true)
    try {
      await api.post(`/journals/${id}/post`)
      toast.success('تم ترحيل القيد بنجاح')
      fetchEntries()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في ترحيل القيد')
    } finally {
      setPosting(false)
    }
  }

  const handleReverse = async (id: number) => {
    if (!confirm('هل أنت متأكد من عكس هذا القيد؟')) return
    try {
      await api.post(`/journals/${id}/reverse`)
      toast.success('تم عكس القيد بنجاح')
      fetchEntries()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في عكس القيد')
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا القيد؟')) return
    try {
      await api.post(`/journals/${id}/cancel`)
      toast.success('تم إلغاء القيد بنجاح')
      fetchEntries()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في إلغاء القيد')
    }
  }

  const handleExport = () => {
    toast.success('جاري تصدير القيود...')
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredEntries = entries.filter(
    (e) => e.description?.includes(search) || e.entry_number.includes(search)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'posted': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'reversed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'posted': return 'مرحل'
      case 'cancelled': return 'ملغى'
      case 'reversed': return 'معكوس'
      default: return status
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">القيود اليومية</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            <Download size={20} />
            تصدير
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700">
            <Printer size={20} />
            طباعة
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Plus size={20} />
            إضافة قيد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالرقم أو البيان..."
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">رقم القيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">البيان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجمالي المدين</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجمالي الدائن</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.entry_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{entry.lines?.reduce((s, l) => s + l.debit, 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{entry.lines?.reduce((s, l) => s + l.credit, 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {entry.status === 'draft' && (
                        <>
                          <button onClick={() => openModal(entry)} className="text-blue-600 hover:text-blue-800" title="تعديل">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handlePost(entry.id)} disabled={posting} className="text-green-600 hover:text-green-800" title="ترحيل">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleCancel(entry.id)} className="text-red-600 hover:text-red-800" title="إلغاء">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {entry.status === 'posted' && (
                        <button onClick={() => handleReverse(entry.id)} className="text-orange-600 hover:text-orange-800" title="عكس">
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEntries.length === 0 && (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingEntry ? 'تعديل قيد يومي' : 'إضافة قيد يومي'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                  <input {...register('entry_date')} type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المرجع</label>
                  <input {...register('reference')} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العملة</label>
                  <select {...register('currency')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">سعر الصرف</label>
                  <input {...register('exchange_rate')} type="number" step="0.0001" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الصندوق / الاحتياطي</label>
                  <select {...register('fund_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                    <option value="0">اختر</option>
                    {fundsList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المشروع</label>
                  <select {...register('project_id')} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                    <option value="0">اختر</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البيان</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-700">أسطر القيد</h3>
                  <button type="button" onClick={() => append({ account_id: 0, fund_id: 0, project_id: 0, cost_center_id: 0, debit: 0, credit: 0, description: '' })} className="text-blue-600 hover:text-blue-800 text-sm">
                    + إضافة سطر
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">الحساب</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">الصندوق / الاحتياطي</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">المشروع</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">مدين</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">دائن</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">البيان</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td className="px-3 py-2">
                            <select {...register(`lines.${index}.account_id`)} className="w-full px-2 py-1 border border-slate-300 rounded">
                              <option value="0">اختر</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select {...register(`lines.${index}.fund_id`)} className="w-full px-2 py-1 border border-slate-300 rounded">
                              <option value="0">اختر</option>
                              {fundsList.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select {...register(`lines.${index}.project_id`)} className="w-full px-2 py-1 border border-slate-300 rounded">
                              <option value="0">اختر</option>
                              {projectsList.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input {...register(`lines.${index}.debit`)} type="number" step="0.01" className="w-full px-2 py-1 border border-slate-300 rounded" />
                          </td>
                          <td className="px-3 py-2">
                            <input {...register(`lines.${index}.credit`)} type="number" step="0.01" className="w-full px-2 py-1 border border-slate-300 rounded" />
                          </td>
                          <td className="px-3 py-2">
                            <input {...register(`lines.${index}.description`)} className="w-full px-2 py-1 border border-slate-300 rounded" />
                          </td>
                          <td className="px-3 py-2">
                            {fields.length > 2 && (
                              <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end gap-4 text-sm">
                  <div className={`px-4 py-2 rounded ${totals.balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    إجمالي المدين: {totals.debit.toLocaleString()}
                  </div>
                  <div className={`px-4 py-2 rounded ${totals.balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    إجمالي الدائن: {totals.credit.toLocaleString()}
                  </div>
                  <div className={`px-4 py-2 rounded ${totals.balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {totals.balanced ? 'متوازن' : 'غير متوازن'}
                  </div>
                </div>
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
