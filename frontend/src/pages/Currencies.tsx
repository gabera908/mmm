import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { Currency, ExchangeRate } from '../types'
import toast from 'react-hot-toast'

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)

  useEffect(() => {
    api.get('/currencies').then((res) => setCurrencies(res.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/currencies/${id}`)
      toast.success('تم الحذف بنجاح')
      setCurrencies(currencies.filter((c) => c.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const openModal = (currency?: Currency) => {
    setEditingCurrency(currency || null)
    setShowModal(true)
  }

  const viewRates = async (currency: Currency) => {
    setSelectedCurrency(currency)
    try {
      const res = await api.get(`/currencies/${currency.id}/rates`)
      setRates(res.data)
    } catch {
      setRates([])
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">العملات</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة عملة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الرمز</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">أساسية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{currency.code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{currency.symbol}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${currency.is_base ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {currency.is_base ? 'أساسية' : 'ثانوية'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${currency.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {currency.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button onClick={() => viewRates(currency)} className="text-blue-600 hover:text-blue-800" title="أسعار الصرف">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => openModal(currency)} className="text-blue-600 hover:text-blue-800 ml-2" title="تعديل">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => handleDelete(currency.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingCurrency ? 'تعديل عملة' : 'إضافة عملة'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                symbol: formData.get('symbol') as string,
                is_base: formData.get('is_base') === 'on',
                is_active: formData.get('is_active') === 'on',
              }
              const action = editingCurrency
                ? api.put(`/currencies/${editingCurrency.id}`, data)
                : api.post('/currencies', data)
              action.then(() => {
                toast.success(editingCurrency ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                api.get('/currencies').then((res) => setCurrencies(res.data))
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الكود</label>
                <input name="code" defaultValue={editingCurrency?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                <input name="name" defaultValue={editingCurrency?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الرمز</label>
                <input name="symbol" defaultValue={editingCurrency?.symbol} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_base" type="checkbox" defaultChecked={editingCurrency?.is_base || false} className="rounded" />
                <label className="text-sm text-slate-700">عملة أساسية</label>
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingCurrency?.is_active ?? true} className="rounded" />
                <label className="text-sm text-slate-700">نشط</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCurrency && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">أسعار صرف {selectedCurrency.name}</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowRateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                <Plus size={16} />
                إضافة سعر
              </button>
              <button onClick={() => setSelectedCurrency(null)} className="text-slate-500 hover:text-slate-700">إغلاق</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-700">{rate.rate_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{rate.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rates.length === 0 && (
              <div className="p-4 text-center text-slate-500">لا توجد أسعار صرف</div>
            )}
          </div>
        </div>
      )}

      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة سعر صرف</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                currency_id: selectedCurrency?.id,
                rate: Number(formData.get('rate')),
                rate_date: formData.get('rate_date') as string,
              }
              api.post('/exchange-rates', data).then(() => {
                toast.success('تم إضافة سعر الصرف بنجاح')
                setShowRateModal(false)
                viewRates(selectedCurrency!)
              }).catch((error: any) => {
                toast.error(error.response?.data?.detail || 'خطأ في الحفظ')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                <input name="rate_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">السعر</label>
                <input name="rate" type="number" step="0.0001" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowRateModal(false)} className="px-4 py-2 border border-slate-300 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
