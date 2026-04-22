"use client"

import { useEffect, useMemo, useState } from "react"

type DraftValue = string

export function usePersistedFormDraft<T extends Record<string, DraftValue>>(storageKey: string, initialValues: T) {
  const initialSnapshot = useMemo(() => initialValues, [initialValues])
  const [values, setValues] = useState<T>(initialSnapshot)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (!stored) {
        setValues(initialSnapshot)
        setIsHydrated(true)
        return
      }

      const parsed = JSON.parse(stored) as Partial<T>
      setValues({ ...initialSnapshot, ...parsed })
    } catch {
      setValues(initialSnapshot)
    } finally {
      setIsHydrated(true)
    }
  }, [initialSnapshot, storageKey])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(values))
  }, [isHydrated, storageKey, values])

  function updateValue<K extends keyof T>(key: K, value: T[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function clearDraft() {
    window.localStorage.removeItem(storageKey)
    setValues(initialSnapshot)
  }

  return {
    values,
    setValues,
    updateValue,
    clearDraft,
    isHydrated,
  }
}
