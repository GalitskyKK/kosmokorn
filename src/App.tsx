import React, { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IUserData, IStorageData, IAppState } from "@/types"
import { DEFAULT_SETTINGS } from "@/constants"
import { StorageService } from "@/services/storageService"
import { usePlanetEvolution } from "@/hooks/usePlanetEvolution"
import { useDailyCheck, useVisitStreak } from "@/hooks/useDailyCheck"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { validatePlanetName, isTouchDevice } from "@/utils"
import Loading from "@/components/ui/Loading"

// Ленивая загрузка компонентов для оптимизации
const WelcomeScreen = React.lazy(() => import("./screens/WelcomeScreen"))
const PlanetScreen = React.lazy(() => import("./screens/PlanetScreen"))
const EventsScreen = React.lazy(() => import("./screens/EventsScreen"))
const SettingsScreen = React.lazy(() => import("./screens/SettingsScreen"))
const DevTools = React.lazy(() => import("./components/dev/DevTools"))

/**
 * Главный компонент приложения KosmoKorn
 * Управляет роутингом, состоянием и жизненным циклом приложения
 */
const App: React.FC = () => {
  // Глобальное состояние приложения
  const [appState, setAppState] = useState<IAppState>({
    isInitialized: false,
    isFirstVisit: true,
    currentView: "welcome",
    isLoading: true,
    error: null
  })

  // Данные пользователя в localStorage
  const {
    value: userData,
    setValue: setUserData,
    isLoading: isUserDataLoading
  } = useLocalStorage<IUserData | null>("kosmokorn-user", null)

  // Ежедневные визиты и серии
  const { isNewDay, daysPassed, updateLastVisit } = useDailyCheck(userData?.lastVisit)
  const { currentStreak, updateStreak } = useVisitStreak()

  // Эволюция планеты
  const {
    planetData,
    isLoading: isPlanetLoading,
    error: planetError,
    triggerEvolution
  } = usePlanetEvolution(userData?.seed || "", userData?.currentDay || 1)

  // Определение первого запуска
  // const isFirstVisit = !userData

  // Инициализация приложения
  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        setAppState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Загружаем сохраненные данные
        const savedData = StorageService.load()

        if (savedData && StorageService.validateData(savedData)) {
          // Данные найдены и валидны
          setUserData(savedData.userData)
          setAppState((prev) => ({
            ...prev,
            isFirstVisit: false,
            currentView: "planet",
            isInitialized: true
          }))
        } else {
          // Первый запуск или поврежденные данные
          setAppState((prev) => ({
            ...prev,
            isFirstVisit: true,
            currentView: "welcome",
            isInitialized: true
          }))
        }
      } catch (error) {
        console.error("Ошибка инициализации приложения:", error)
        setAppState((prev) => ({
          ...prev,
          error: "Ошибка загрузки приложения",
          isInitialized: true
        }))
      } finally {
        setAppState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    if (!isUserDataLoading) {
      initializeApp()
    }
  }, [isUserDataLoading, setUserData])

  // Обработка ежедневного визита
  useEffect(() => {
    if (userData && isNewDay && daysPassed > 0) {
      handleDailyVisit()
    }
  }, [userData, isNewDay, daysPassed])

  // Обработка создания новой планеты
  const handleCreatePlanet = async (planetName: string): Promise<void> => {
    const validation = validatePlanetName(planetName)
    if (!validation.isValid) {
      setAppState((prev) => ({ ...prev, error: validation.error || null }))
      return
    }

    try {
      setAppState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Создаем seed на основе имени планеты и времени
      const seed = `${planetName}-${Date.now()}`

      const newUserData: IUserData = {
        seed,
        planetName,
        currentDay: 1,
        lastVisit: new Date(),
        totalVisits: 1,
        achievements: ["first_visit"],
        settings: DEFAULT_SETTINGS
      }

      // Сохраняем данные
      setUserData(newUserData)

      const storageData: IStorageData = {
        userData: newUserData,
        planetData: null, // Будет сгенерировано хуком
        eventHistory: [],
        version: "1.0.0"
      }

      StorageService.save(storageData)

      // Переходим к экрану планеты
      setAppState((prev) => ({
        ...prev,
        isFirstVisit: false,
        currentView: "planet",
        isLoading: false
      }))

      // Обновляем серию визитов
      updateStreak(1)
    } catch (error) {
      console.error("Ошибка создания планеты:", error)
      setAppState((prev) => ({ ...prev, error: "Ошибка создания планеты", isLoading: false }))
    }
  }

  // Обработка ежедневного визита
  const handleDailyVisit = async (): Promise<void> => {
    if (!userData) return

    try {
      setAppState((prev) => ({ ...prev, isLoading: true }))

      const updatedUserData: IUserData = {
        ...userData,
        currentDay: userData.currentDay + daysPassed,
        lastVisit: new Date(),
        totalVisits: userData.totalVisits + 1
      }

      // Проверяем достижения
      const newAchievements = [...updatedUserData.achievements]
      if (currentStreak >= 7 && !newAchievements.includes("week_streak")) {
        newAchievements.push("week_streak")
      }
      if (planetData?.stage === "mature" && !newAchievements.includes("mature_planet")) {
        newAchievements.push("mature_planet")
      }
      if (
        planetData &&
        planetData.events.length >= 10 &&
        !newAchievements.includes("event_collector")
      ) {
        newAchievements.push("event_collector")
      }

      updatedUserData.achievements = newAchievements
      setUserData(updatedUserData)

      // Сохраняем в localStorage
      const storageData: IStorageData = {
        userData: updatedUserData,
        planetData,
        eventHistory: planetData?.events || [],
        version: "1.0.0"
      }

      StorageService.save(storageData)

      // Обновляем последний визит
      updateLastVisit()

      // Обновляем серию визитов
      updateStreak(daysPassed)

      // Запускаем эволюцию планеты
      await triggerEvolution()
    } catch (error) {
      console.error("Ошибка обработки ежедневного визита:", error)
      setAppState((prev) => ({ ...prev, error: "Ошибка обновления планеты" }))
    } finally {
      setAppState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Навигация между экранами
  const navigateToView = (view: IAppState["currentView"]): void => {
    setAppState((prev) => ({ ...prev, currentView: view, error: null }))
  }

  // Сброс данных пользователя
  const handleReset = (): void => {
    setUserData(null)
    StorageService.clear()
    setAppState({
      isInitialized: true,
      isFirstVisit: true,
      currentView: "welcome",
      isLoading: false,
      error: null
    })
  }

  // Симуляция определенного дня (для тестирования)
  const handleSimulateDay = async (targetDay: number): Promise<void> => {
    if (!userData) return

    try {
      setAppState((prev) => ({ ...prev, isLoading: true }))

      // Обновляем текущий день пользователя
      const updatedUserData = { ...userData, currentDay: targetDay }
      setUserData(updatedUserData)

      // Устанавливаем дату последнего визита на нужное количество дней назад
      const simulatedDate = new Date()
      simulatedDate.setDate(simulatedDate.getDate() - (targetDay - 1))
      localStorage.setItem("kosmokorn-last-visit", simulatedDate.toISOString())

      // Сохраняем данные
      const storageData: IStorageData = {
        userData: updatedUserData,
        planetData,
        eventHistory: planetData?.events || [],
        version: "1.0.0"
      }
      StorageService.save(storageData)

      // Принудительно запускаем эволюцию
      await triggerEvolution()

      setAppState((prev) => ({ ...prev, isLoading: false }))
    } catch (error) {
      console.error("Ошибка симуляции дня:", error)
      setAppState((prev) => ({
        ...prev,
        error: "Ошибка симуляции дня",
        isLoading: false
      }))
    }
  }

  // Сброс времени к первому дню
  const handleResetTime = (): void => {
    if (!userData) return

    // Обновляем данные пользователя
    const updatedUserData = { ...userData, currentDay: 1 }
    setUserData(updatedUserData)

    // Устанавливаем дату последнего визита на сегодня
    const now = new Date()
    localStorage.setItem("kosmokorn-last-visit", now.toISOString())

    // Сохраняем данные
    const storageData: IStorageData = {
      userData: updatedUserData,
      planetData,
      eventHistory: [],
      version: "1.0.0"
    }
    StorageService.save(storageData)

    // Перезагружаем страницу для полного сброса состояния
    window.location.reload()
  }

  // Обновление настроек
  const handleSettingsUpdate = (newSettings: IUserData["settings"]): void => {
    if (userData) {
      const updatedUserData = { ...userData, settings: newSettings }
      setUserData(updatedUserData)

      const storageData: IStorageData = {
        userData: updatedUserData,
        planetData,
        eventHistory: planetData?.events || [],
        version: "1.0.0"
      }
      StorageService.save(storageData)
    }
  }

  // Показываем загрузку при инициализации
  if (!appState.isInitialized || appState.isLoading) {
    return (
      <Loading
        fullScreen
        variant="cosmic"
        size="xl"
        text={appState.isLoading ? "Загрузка вселенной..." : "Инициализация космоса..."}
      />
    )
  }

  // Показываем ошибку
  if (appState.error) {
    return (
      <div className="min-h-screen-mobile flex items-center justify-center p-4 bg-gradient-to-br from-red-900 to-red-800">
        <motion.div
          className="text-center text-white max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Космическая ошибка</h2>
          <p className="text-red-200 mb-4">{appState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-red-900 rounded-lg font-medium hover:bg-red-50 transition-colors">
            Перезагрузить приложение
          </button>
        </motion.div>
      </div>
    )
  }

  const currentViewProps = {
    userData,
    planetData,
    onNavigate: navigateToView,
    onCreatePlanet: handleCreatePlanet,
    onDailyVisit: handleDailyVisit,
    onReset: handleReset,
    onSettingsUpdate: handleSettingsUpdate,
    isNewDay,
    daysPassed,
    currentStreak,
    isPlanetLoading,
    planetError
  }

  return (
    <div
      className={`
        min-h-screen-mobile bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300
        ${isTouchDevice() ? "touch-manipulation" : ""}
      `}>
      <div className="safe-top safe-bottom safe-left safe-right">
        <Suspense
          fallback={<Loading fullScreen variant="cosmic" size="lg" text="Загрузка экрана..." />}>
          <AnimatePresence mode="wait">
            {appState.currentView === "welcome" && (
              <WelcomeScreen key="welcome" {...currentViewProps} />
            )}
            {appState.currentView === "planet" && (
              <PlanetScreen key="planet" {...currentViewProps} />
            )}
            {appState.currentView === "events" && (
              <EventsScreen key="events" {...currentViewProps} />
            )}
            {appState.currentView === "settings" && (
              <SettingsScreen key="settings" {...currentViewProps} />
            )}
          </AnimatePresence>
        </Suspense>
      </div>

      {/* Глобальные уведомления */}
      <AnimatePresence>
        {isNewDay && daysPassed > 1 && (
          <motion.div
            className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}>
            <div className="text-sm font-medium">
              {daysPassed === 2
                ? "Вы пропустили вчерашний день!"
                : `Прошло ${daysPassed} дней с последнего визита!`}
            </div>
            <div className="text-xs opacity-90 mt-1">
              Ваша планета сильно изменилась за это время
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Tools (только в development режиме) */}
      <Suspense fallback={null}>
        <DevTools
          userData={userData}
          planetData={planetData}
          onSimulateDay={handleSimulateDay}
          onResetTime={handleResetTime}
        />
      </Suspense>
    </div>
  )
}

export default App
