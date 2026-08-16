import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { Plus, Search, Trash2, Edit, ChevronRight, ChevronDown } from 'lucide-react'
import { Account } from '../types'
import toast from 'react-hot-toast'

interface TreeNode extends Account {
  children?: TreeNode[]
}

import React from 'react'

export default function Accounts() {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const fetchAccounts = async () => {
    try {
      const accountsRes = await api.get('/accounts')
      buildTree(accountsRes.data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const buildTree = (items: Account[]) => {
    const map = new Map<number, TreeNode>()
    const roots: TreeNode[] = []
    items.forEach((item) => map.set(item.id, { ...item, children: [] }))
    items.forEach((item) => {
      const node = map.get(item.id)!
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.children!.push(node)
      } else {
        roots.push(node)
      }
    })
    setTreeData(roots)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await api.delete(`/accounts/${id}`)
      toast.success('تم الحذف بنجاح')
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطأ في الحذف')
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredAccounts = useMemo(() => {
    let filtered = treeData
    if (search) {
      const searchLower = search.toLowerCase()
      const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.reduce<TreeNode[]>((acc, node) => {
          const matches = node.name.toLowerCase().includes(searchLower) || node.code.toLowerCase().includes(searchLower)
          const filteredChildren = filterNodes(node.children || [])
          if (matches || filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren })
          }
          return acc
        }, [])
      }
      filtered = filterNodes(filtered)
    }
    if (accountTypeFilter) {
      const filterByType = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.reduce<TreeNode[]>((acc, node) => {
          const filteredChildren = filterByType(node.children || [])
          if (node.account_type_id.toString() === accountTypeFilter || filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren })
          }
          return acc
        }, [])
      }
      filtered = filterByType(filtered)
    }
    return filtered
  }, [treeData, search, accountTypeFilter])

  const renderTree = (nodes: TreeNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        <tr className="hover:bg-slate-50">
          <td className="px-6 py-3 text-sm text-slate-700">
            <div className="flex items-center" style={{ paddingRight: `${level * 24}px` }}>
              {(node.children && node.children.length > 0) ? (
                <button onClick={() => toggleExpand(node.id)} className="ml-1">
                  {expandedIds.has(node.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : <span className="w-4 inline-block ml-1" />}
              {node.code}
            </div>
          </td>
          <td className="px-6 py-3 text-sm text-slate-700" style={{ paddingRight: `${(level + 1) * 24}px` }}>{node.name}</td>
          <td className="px-6 py-3 text-sm text-slate-700">{node.level}</td>
          <td className="px-6 py-3 text-sm text-slate-700">{node.account_type_id}</td>
          <td className="px-6 py-3 text-sm">
            <button
              onClick={async () => {
                try {
                  await api.patch(`/accounts/${node.id}`, { is_active: !node.is_active })
                  toast.success('تم تحديث الحالة')
                  fetchAccounts()
                } catch (error: any) {
                  toast.error(error.response?.data?.detail || 'خطأ')
                }
              }}
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${node.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              {node.is_active ? 'نشط' : 'معطل'}
            </button>
          </td>
          <td className="px-6 py-3 text-sm">
            <button onClick={() => { setEditingAccount(node); setShowModal(true) }} className="text-blue-600 hover:text-blue-800 ml-2">
              <Edit size={16} />
            </button>
            <button onClick={() => handleDelete(node.id)} className="text-red-600 hover:text-red-800">
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
        {expandedIds.has(node.id) && node.children && renderTree(node.children, level + 1)}
      </React.Fragment>
    ))
  }

      const flatAccounts = useMemo(() => {
        const flatten = (nodes: TreeNode[]): Account[] => {
          return nodes.reduce<Account[]>((acc, node) => {
            acc.push({ ...node, children: undefined } as Account)
            if (node.children) acc.push(...flatten(node.children))
            return acc
          }, [])
        }
        return flatten(treeData)
      }, [treeData])

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">شجرة الحسابات</h1>
        <button onClick={() => { setEditingAccount(null); setShowModal(true) }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus size={20} />
          إضافة حساب
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالكود أو الاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="">كل الأنواع</option>
            <option value="1">أصول</option>
            <option value="2">خصوم</option>
            <option value="3">صافي الأصول</option>
            <option value="4">إيرادات</option>
            <option value="5">مصروفات</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الكود</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">المستوى</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">نوع الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {renderTree(filteredAccounts)}
              </tbody>
            </table>
            {filteredAccounts.length === 0 && (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingAccount ? 'تعديل حساب' : 'إضافة حساب'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const data = {
                code: formData.get('code') as string,
                name: formData.get('name') as string,
                parent_id: formData.get('parent_id') ? Number(formData.get('parent_id')) : null,
                account_type_id: Number(formData.get('account_type_id')),
                level: Number(formData.get('level')) || 1,
                is_active: formData.get('is_active') === 'on',
                description: formData.get('description') as string || '',
              }
              const action = editingAccount
                ? api.put(`/accounts/${editingAccount.id}`, data)
                : api.post('/accounts', data)
              action.then(() => {
                toast.success(editingAccount ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح')
                setShowModal(false)
                fetchAccounts()
              }).catch((error: any) => {
                const detail = error.response?.data?.detail
                const msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map((d: any) => d.msg || d).join(', ') : 'خطأ في الحفظ')
                toast.error(msg)
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كود الحساب</label>
                <input name="code" defaultValue={editingAccount?.code} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الحساب</label>
                <input name="name" defaultValue={editingAccount?.name} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحساب الأب</label>
                <select name="parent_id" defaultValue={editingAccount?.parent_id || ''} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="">بدون أب</option>
                  {flatAccounts.filter(a => a.id !== editingAccount?.id).map((a) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نوع الحساب</label>
                <select name="account_type_id" defaultValue={editingAccount?.account_type_id || 1} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="1">أصول</option>
                  <option value="2">خصوم</option>
                  <option value="3">صافي الأصول</option>
                  <option value="4">إيرادات</option>
                  <option value="5">مصروفات</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المستوى</label>
                <input name="level" type="number" min="1" max="5" defaultValue={editingAccount?.level || 1} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea name="description" defaultValue={editingAccount?.description} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked={editingAccount?.is_active ?? true} className="rounded" />
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
    </div>
  )
}
