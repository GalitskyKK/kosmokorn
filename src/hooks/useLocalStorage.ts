import { useState, useEffect, useCallback } from "react"
import { IUseLocalStorage } from "@/types"

/**
 * Хук для работы с localStorage
 * Обеспечивает типобезопасную работу с данными и автоматическую синхронизацию
 */
export const useLocalStorage = <T>(key: string, initialValue: T): IUseLocalStorage<T> => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [value, setValue] = useState<T>(initialValue)

  // Функция для чтения данных из localStorage
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)

      if (item === null) {
        return initialValue
      }

      return JSON.parse(item)
    } catch (error) {
      console.warn(`Ошибка чтения localStorage для ключа "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  // Функция для записи данных в localStorage
  const writeValue = useCallback(
    (newValue: T): void => {
      if (typeof window === "undefined") {
        console.warn("localStorage недоступен в серверной среде")
        return
      }

      try {
        setValue(newValue)
        window.localStorage.setItem(key, JSON.stringify(newValue))

        // Отправляем кастомное событие для синхронизации между вкладками
        window.dispatchEvent(
          new CustomEvent("localStorage-update", {
            detail: { key, value: newValue }
          })
        )
      } catch (error) {
        console.error(`Ошибка записи в localStorage для ключа "${key}":`, error)
      }
    },
    [key]
  )

  // Функция для очистки значения
  const clearValue = useCallback((): void => {
    if (typeof window === "undefined") {
      console.warn("localStorage недоступен в серверной среде")
      return
    }

    try {
      setValue(initialValue)
      window.localStorage.removeItem(key)

      window.dispatchEvent(
        new CustomEvent("localStorage-update", {
          detail: { key, value: null }
        })
      )
    } catch (error) {
      console.error(`Ошибка удаления из localStorage для ключа "${key}":`, error)
    }
  }, [initialValue, key])

  // Инициализация значения при первом рендере
  useEffect(() => {
    try {
      const storedValue = readValue()
      setValue(storedValue)
    } catch {
      setValue(initialValue)
    } finally {
      setIsLoading(false)
    }
  }, [readValue, initialValue])

  // Слушаем изменения localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent): void => {
      if ("key" in e && e.key === key) {
        if (e.newValue === null) {
          setValue(initialValue)
        } else if (e.newValue !== undefined) {
          try {
            setValue(JSON.parse(e.newValue))
          } catch {
            setValue(initialValue)
          }
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent): void => {
      if (e.detail?.key === key) {
        setValue(e.detail.value ?? initialValue)
      }
    }

    // Слушаем стандартные события storage и наши кастомные события
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("localStorage-update", handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorage-update", handleCustomStorageChange as EventListener)
    }
  }, [initialValue, key])

  return {
    value,
    setValue: writeValue,
    clearValue,
    isLoading
  }
}

/**
 * Хук для работы с несколькими ключами localStorage
 */
export const useMultipleLocalStorage = <T extends Record<string, any>>(
  keys: Array<keyof T>,
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Загружаем все значения при инициализации
  useEffect(() => {
    const loadValues = async (): Promise<void> => {
      try {
        const loadedValues: Partial<T> = {}

        for (const key of keys) {
          try {
            const item = localStorage.getItem(String(key))
            if (item !== null) {
              loadedValues[key] = JSON.parse(item)
            } else {
              loadedValues[key] = initialValues[key]
            }
          } catch {
            loadedValues[key] = initialValues[key]
          }
        }

        setValues(loadedValues as T)
      } catch (error) {
        console.error("Ошибка загрузки данных из localStorage:", error)
        setValues(initialValues)
      } finally {
        setIsLoading(false)
      }
    }

    loadValues()
  }, [keys, initialValues])

  const updateValue = useCallback(<K extends keyof T>(key: K, value: T[K]): void => {
    try {
      setValues((prev) => ({ ...prev, [key]: value }))
      localStorage.setItem(String(key), JSON.stringify(value))
    } catch (error) {
      console.error(`Ошибка сохранения ${String(key)} в localStorage:`, error)
    }
  }, [])

  const updateMultipleValues = useCallback((updates: Partial<T>): void => {
    try {
      setValues((prev) => ({ ...prev, ...updates }))

      Object.entries(updates).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
    } catch (error) {
      console.error("Ошибка сохранения данных в localStorage:", error)
    }
  }, [])

  const clearAll = useCallback((): void => {
    try {
      keys.forEach((key) => {
        localStorage.removeItem(String(key))
      })
      setValues(initialValues)
    } catch (error) {
      console.error("Ошибка очистки localStorage:", error)
    }
  }, [keys, initialValues])

  return {
    values,
    updateValue,
    updateMultipleValues,
    clearAll,
    isLoading
  }
}

/**
 * Хук для проверки доступности localStorage
 */
export const useLocalStorageSupport = (): boolean => {
  const [isSupported, setIsSupported] = useState<boolean>(false)

  useEffect(() => {
    try {
      const testKey = "__localStorage_test__"
      const testValue = "test"

      localStorage.setItem(testKey, testValue)
      const retrievedValue = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      setIsSupported(retrievedValue === testValue)
    } catch {
      setIsSupported(false)
    }
  }, [])

  return isSupported
}

export default useLocalStorage
