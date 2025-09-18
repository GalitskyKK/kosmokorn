import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IUserData, IPlanetData, IAppState } from "@/types"
import { isTouchDevice, getScreenSize } from "@/utils"
import Button from "@/components/ui/Button"
import Loading from "@/components/ui/Loading"
import Planet2D from "@/components/planet/Planet2D"
import Planet3D, { Planet3DFallback } from "@/components/planet/Planet3D"
import PlanetInfo from "@/components/planet/PlanetInfo"

interface IPlanetScreenProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onNavigate: (view: IAppState["currentView"]) => void
  onDailyVisit: () => Promise<void>
  isNewDay: boolean
  daysPassed: number
  currentStreak: number
  isPlanetLoading: boolean
  planetError: string | null
}

/**
 * Основной экран планеты
 * Показывает 3D/2D модель планеты и ее информацию
 */
const PlanetScreen: React.FC<IPlanetScreenProps> = ({
  userData,
  planetData,
  onNavigate,
  onDailyVisit,
  isNewDay,
  daysPassed,
  currentStreak,
  isPlanetLoading,
  planetError
}) => {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [isProcessingVisit, setIsProcessingVisit] = useState<boolean>(false)

  // Определяем возможности устройства
  const deviceCapabilities = useMemo(() => {
    const screenSize = getScreenSize()
    const isMobile = isTouchDevice()
    const isLowEnd = navigator.hardwareConcurrency <= 4 || window.innerWidth < 768

    return {
      canHandle3D: !isLowEnd && screenSize !== "mobile",
      preferReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      isMobile,
      screenSize
    }
  }, [])

  // Обработка ежедневного визита
  const handleDailyVisit = async (): Promise<void> => {
    try {
      setIsProcessingVisit(true)
      await onDailyVisit()
    } catch (error) {
      console.error("Ошибка ежедневного визита:", error)
    } finally {
      setIsProcessingVisit(false)
    }
  }

  // Если нет данных пользователя или планеты, показываем загрузку
  if (!userData || !planetData) {
    if (isPlanetLoading) {
      return <Loading fullScreen variant="cosmic" size="xl" text="Генерация планеты..." />
    }

    if (planetError) {
      return (
        <div className="min-h-screen-mobile flex items-center justify-center p-4">
          <motion.div
            className="text-center text-white max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-xl font-semibold mb-2">Ошибка загрузки планеты</h2>
            <p className="text-red-200 mb-4">{planetError}</p>
            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
          </motion.div>
        </div>
      )
    }

    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="min-h-screen-mobile flex flex-col relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Навигационная панель */}
      <motion.header
        className="safe-top flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10"
        variants={itemVariants}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white truncate">{userData.planetName}</h1>
          <div className="text-xs text-gray-400">День {planetData.currentDay}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Переключатель 2D/3D */}
          {deviceCapabilities.canHandle3D && (
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  viewMode === "2d" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}>
                2D
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  viewMode === "3d" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}>
                3D
              </button>
            </div>
          )}

          {/* Кнопка информации */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white">
            ℹ️
          </Button>

          {/* Меню */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("settings")}
            className="text-white">
            ⚙️
          </Button>
        </div>
      </motion.header>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Визуализация планеты */}
        <motion.div
          className="flex-1 flex items-center justify-center relative"
          variants={itemVariants}>
          <AnimatePresence mode="wait">
            {viewMode === "2d" ? (
              <motion.div
                key="2d"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center">
                <Planet2D
                  planetData={planetData}
                  size={Math.min(window.innerWidth * 0.6, 300)}
                  animated={!deviceCapabilities.preferReduced}
                  showSatellites
                  showAtmosphere
                  onClick={() => !showInfo && setShowInfo(true)}
                />
              </motion.div>
            ) : deviceCapabilities.canHandle3D ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full">
                <Planet3D
                  planetData={planetData}
                  userSeed={userData?.seed}
                  showControls
                  autoRotate={!deviceCapabilities.preferReduced}
                  enableInteraction
                />
              </motion.div>
            ) : (
              <Planet3DFallback planetData={planetData} />
            )}
          </AnimatePresence>

          {/* Уведомление о новом дне */}
          <AnimatePresence>
            {isNewDay && daysPassed > 0 && (
              <motion.div
                className="absolute top-4 left-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-lg"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌟</div>
                  <h3 className="font-semibold">
                    {daysPassed === 1 ? "Новый день!" : `Прошло ${daysPassed} дней!`}
                  </h3>
                  <p className="text-sm opacity-90 mb-3">Ваша планета готова к эволюции</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDailyVisit}
                    isLoading={isProcessingVisit}
                    fullWidth>
                    {isProcessingVisit ? "Эволюция..." : "✨ Начать эволюцию"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Информационная панель */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}>
              <motion.div
                className="min-h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}>
                <motion.div
                  className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  transition={{ type: "spring", damping: 20 }}>
                  <PlanetInfo planetData={planetData} animated />

                  <div className="mt-6 text-center">
                    <Button onClick={() => setShowInfo(false)} variant="outline">
                      Закрыть
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Нижняя панель с основной информацией */}
        <motion.div
          className="safe-bottom bg-black/30 backdrop-blur-sm border-t border-white/10 p-4"
          variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400">Серия</div>
                <div className="text-sm font-semibold text-white">
                  {currentStreak} {currentStreak === 1 ? "день" : "дней"}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-400">Стадия</div>
                <div className="text-sm font-semibold text-white">{planetData.stage}</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-400">События</div>
                <div className="text-sm font-semibold text-white">{planetData.events.length}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("events")}
                className="text-white border-white/30">
                📜 События
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PlanetScreen
