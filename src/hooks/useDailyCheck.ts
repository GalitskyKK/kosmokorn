import { useState, useEffect, useCallback } from "react"
import { IUseDailyCheck } from "@/types"

/**
 * Хук для проверки ежедневных визитов
 * Определяет новые дни, рассчитывает количество пропущенных дней
 */
export const useDailyCheck = (lastVisitDate?: Date): IUseDailyCheck => {
  const [lastVisit, setLastVisit] = useState<Date | null>(lastVisitDate || null)
  const [isNewDay, setIsNewDay] = useState<boolean>(false)
  const [daysPassed, setDaysPassed] = useState<number>(0)

  // Функция для проверки, наступил ли новый день
  const checkNewDay = useCallback((): { isNew: boolean; daysPassed: number } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (!lastVisit) {
      // При первом создании планеты - это день 1, но никаких дней не прошло
      return { isNew: false, daysPassed: 0 }
    }

    const lastVisitDay = new Date(
      lastVisit.getFullYear(),
      lastVisit.getMonth(),
      lastVisit.getDate()
    )

    // Рассчитываем разность в днях
    const diffTime = today.getTime() - lastVisitDay.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Новый день наступает только если прошли реальные календарные дни
    // И прошло минимум 4 часа с последнего визита для предотвращения случайных срабатываний
    const hoursPassed = diffTime / (1000 * 60 * 60)
    const isRealNewDay = diffDays > 0 && hoursPassed >= 4

    return {
      isNew: isRealNewDay,
      daysPassed: Math.max(0, diffDays)
    }
  }, [lastVisit])

  // Обновляем дату последнего визита
  const updateLastVisit = useCallback((): void => {
    const now = new Date()
    setLastVisit(now)
    setIsNewDay(false)
    setDaysPassed(0)

    // Сохраняем в localStorage для персистентности
    try {
      localStorage.setItem("kosmokorn-last-visit", now.toISOString())
    } catch (error) {
      console.error("Ошибка сохранения даты последнего визита:", error)
    }
  }, [])

  // Проверяем при инициализации и периодически
  useEffect(() => {
    // Загружаем последний визит из localStorage при инициализации
    if (!lastVisit) {
      try {
        const storedLastVisit = localStorage.getItem("kosmokorn-last-visit")
        if (storedLastVisit) {
          const date = new Date(storedLastVisit)
          if (!isNaN(date.getTime())) {
            setLastVisit(date)
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки даты последнего визита:", error)
      }
    }
  }, [lastVisit])

  // Проверяем новый день при изменении lastVisit
  useEffect(() => {
    const { isNew, daysPassed: days } = checkNewDay()
    setIsNewDay(isNew)
    setDaysPassed(days)
  }, [checkNewDay, lastVisit])

  // Периодическая проверка (каждую минуту)
  useEffect(() => {
    const interval = setInterval(() => {
      const { isNew, daysPassed: days } = checkNewDay()
      setIsNewDay(isNew)
      setDaysPassed(days)
    }, 60000) // Проверяем каждую минуту

    return () => clearInterval(interval)
  }, [checkNewDay])

  return {
    isNewDay,
    daysPassed,
    lastVisit,
    updateLastVisit
  }
}

/**
 * Хук для отслеживания серии ежедневных визитов (streak)
 */
export const useVisitStreak = () => {
  const [currentStreak, setCurrentStreak] = useState<number>(0)
  const [longestStreak, setLongestStreak] = useState<number>(0)
  const [lastStreakUpdate, setLastStreakUpdate] = useState<Date | null>(null)

  // Загружаем данные из localStorage
  useEffect(() => {
    try {
      const storedCurrentStreak = localStorage.getItem("kosmokorn-current-streak")
      const storedLongestStreak = localStorage.getItem("kosmokorn-longest-streak")
      const storedLastUpdate = localStorage.getItem("kosmokorn-streak-update")

      if (storedCurrentStreak) {
        setCurrentStreak(parseInt(storedCurrentStreak, 10) || 0)
      }

      if (storedLongestStreak) {
        setLongestStreak(parseInt(storedLongestStreak, 10) || 0)
      }

      if (storedLastUpdate) {
        const date = new Date(storedLastUpdate)
        if (!isNaN(date.getTime())) {
          setLastStreakUpdate(date)
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки данных серии визитов:", error)
    }
  }, [])

  // Обновляем серию при визите
  const updateStreak = useCallback(
    (daysPassed: number): void => {
      const now = new Date()

      try {
        let newCurrentStreak = currentStreak

        if (daysPassed === 1) {
          // Ежедневный визит - увеличиваем серию
          newCurrentStreak = currentStreak + 1
        } else if (daysPassed > 1) {
          // Пропустили дни - сбрасываем серию
          newCurrentStreak = 1
        }

        // Обновляем рекорд если нужно
        const newLongestStreak = Math.max(longestStreak, newCurrentStreak)

        setCurrentStreak(newCurrentStreak)
        setLongestStreak(newLongestStreak)
        setLastStreakUpdate(now)

        // Сохраняем в localStorage
        localStorage.setItem("kosmokorn-current-streak", newCurrentStreak.toString())
        localStorage.setItem("kosmokorn-longest-streak", newLongestStreak.toString())
        localStorage.setItem("kosmokorn-streak-update", now.toISOString())
      } catch (error) {
        console.error("Ошибка обновления серии визитов:", error)
      }
    },
    [currentStreak, longestStreak]
  )

  // Сбрасываем серию
  const resetStreak = useCallback((): void => {
    try {
      setCurrentStreak(0)
      setLastStreakUpdate(new Date())

      localStorage.setItem("kosmokorn-current-streak", "0")
      localStorage.setItem("kosmokorn-streak-update", new Date().toISOString())
    } catch (error) {
      console.error("Ошибка сброса серии визитов:", error)
    }
  }, [])

  return {
    currentStreak,
    longestStreak,
    lastStreakUpdate,
    updateStreak,
    resetStreak
  }
}

/**
 * Хук для уведомлений о пропущенных днях
 */
export const useMissedDaysNotification = (daysPassed: number) => {
  const [shouldShowNotification, setShouldShowNotification] = useState<boolean>(false)
  const [notificationMessage, setNotificationMessage] = useState<string>("")

  useEffect(() => {
    if (daysPassed > 1) {
      setShouldShowNotification(true)

      if (daysPassed === 2) {
        setNotificationMessage("Вы пропустили вчерашний день! Ваша планета скучала.")
      } else if (daysPassed <= 7) {
        setNotificationMessage(
          `Прошло ${daysPassed} дней с последнего визита. Ваша планета ждала вас!`
        )
      } else if (daysPassed <= 30) {
        setNotificationMessage(
          `Целых ${daysPassed} дней! Ваша планета сильно изменилась за это время.`
        )
      } else {
        setNotificationMessage(`${daysPassed} дней без вас! Это целая эпоха в жизни планеты.`)
      }
    } else {
      setShouldShowNotification(false)
      setNotificationMessage("")
    }
  }, [daysPassed])

  const dismissNotification = useCallback((): void => {
    setShouldShowNotification(false)
    setNotificationMessage("")
  }, [])

  return {
    shouldShowNotification,
    notificationMessage,
    dismissNotification
  }
}

/**
 * Хук для расчета времени до следующего дня
 */
export const useTimeUntilNextDay = () => {
  const [timeUntilNextDay, setTimeUntilNextDay] = useState<{
    hours: number
    minutes: number
    seconds: number
  }>({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeUntilNextDay = (): void => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilNextDay({ hours, minutes, seconds })
    }

    calculateTimeUntilNextDay()
    const interval = setInterval(calculateTimeUntilNextDay, 1000)

    return () => clearInterval(interval)
  }, [])

  return timeUntilNextDay
}

export default useDailyCheck
