import { clsx, type ClassValue } from "clsx"

/**
 * Утилита для объединения CSS классов
 * Использует clsx для условной логики
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Генерирует уникальный ID
 */
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Форматирует число для отображения (добавляет разделители тысяч)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ru-RU").format(num)
}

/**
 * Форматирует температуру
 */
export function formatTemperature(kelvin: number): string {
  const celsius = kelvin - 273.15
  return `${celsius.toFixed(1)}°C`
}

/**
 * Форматирует процент
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Форматирует дату относительно текущего времени
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    год: 31536000,
    месяц: 2592000,
    день: 86400,
    час: 3600,
    минута: 60
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return `${interval} ${unit}${
        interval > 1
          ? unit === "день"
            ? "дней"
            : unit === "час"
            ? "часов"
            : unit === "месяц"
            ? "месяцев"
            : unit === "год"
            ? "лет"
            : "минут"
          : ""
      } назад`
    }
  }

  return "только что"
}

/**
 * Дебаунс функции
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

/**
 * Тротлинг функции
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Ограничивает значение в заданном диапазоне
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Линейная интерполяция между двумя значениями
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1)
}

/**
 * Мапит значение из одного диапазона в другой
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Проверяет, поддерживает ли устройство тач-события
 */
export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

/**
 * Получает размер экрана
 */
export function getScreenSize(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

/**
 * Проверяет, находимся ли мы в браузере (не на сервере)
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Безопасно парсит JSON
 */
export function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand("copy")
      textArea.remove()
      return success
    }
  } catch {
    return false
  }
}

/**
 * Скачивает данные как файл
 */
export function downloadAsFile(data: string, filename: string, type: string = "text/plain"): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Генерирует HSL цвет на основе строки (для консистентных цветов)
 */
export function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Валидирует имя планеты
 */
export function validatePlanetName(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: "Имя планеты не может быть пустым" }
  }

  if (name.length < 2) {
    return { isValid: false, error: "Имя планеты должно содержать минимум 2 символа" }
  }

  if (name.length > 20) {
    return { isValid: false, error: "Имя планеты не должно превышать 20 символов" }
  }

  const validNameRegex = /^[а-яё\s\w-]+$/i
  if (!validNameRegex.test(name)) {
    return { isValid: false, error: "Имя может содержать только буквы, цифры, пробелы и дефисы" }
  }

  return { isValid: true }
}

/**
 * Расчет времени до полуночи
 */
export function getTimeUntilMidnight(): {
  hours: number
  minutes: number
  seconds: number
  totalMs: number
} {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const totalMs = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(totalMs / (1000 * 60 * 60))
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000)

  return { hours, minutes, seconds, totalMs }
}

export default {
  cn,
  generateId,
  formatNumber,
  formatTemperature,
  formatPercent,
  formatRelativeTime,
  debounce,
  throttle,
  clamp,
  lerp,
  mapRange,
  isTouchDevice,
  getScreenSize,
  isBrowser,
  safeParseJSON,
  copyToClipboard,
  downloadAsFile,
  generateColorFromString,
  validatePlanetName,
  getTimeUntilMidnight
}
