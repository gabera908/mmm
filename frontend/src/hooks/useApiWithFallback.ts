import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import api from '../services/api'
import { dummyData } from '../data/dummyData'

export function useApiWithFallback<T>(endpoint: string, dummyKey: keyof typeof dummyData): { data: T[]; loading: boolean; setData: Dispatch<SetStateAction<T[]>> } {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(endpoint)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data as T[])
        } else {
          setData((dummyData[dummyKey] || []) as unknown as T[])
        }
      })
      .catch(() => {
        setData((dummyData[dummyKey] || []) as unknown as T[])
      })
      .finally(() => setLoading(false))
  }, [endpoint, dummyKey])

  return { data, loading, setData }
}
