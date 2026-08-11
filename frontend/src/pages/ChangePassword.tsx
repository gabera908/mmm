import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../services/api'
import toast from 'react-hot-toast'
import { KeyRound } from 'lucide-react'

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  new_password: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirm_password'],
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function ChangePassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [mustChange, setMustChange] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    let cancelled = false
    api.get('/users/me').then((res) => {
      if (cancelled) return
      setMustChange(res.data.must_change_password || false)
      setChecking(false)
    }).catch((err) => {
      if (cancelled) return
      console.error('Failed to load user info', err)
      setError('تعذر تحميل بيانات المستخدم')
      setChecking(false)
    })
    return () => { cancelled = true }
  }, [navigate])

  const onSubmit = async (data: ChangePasswordForm) => {
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
      toast.success('تم تغيير كلمة المرور بنجاح')
      setTimeout(() => navigate('/'), 1500)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900" dir="rtl">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-slate-700 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">تغيير كلمة المرور</h1>
          <p className="text-slate-600">
            {mustChange ? 'يجب تغيير كلمة المرور عند أول تسجيل دخول' : 'يمكنك تغيير كلمة المرور من هنا'}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              {...register('old_password')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.old_password && <p className="text-red-500 text-sm mt-1">{errors.old_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              {...register('new_password')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              {...register('confirm_password')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  )
}
