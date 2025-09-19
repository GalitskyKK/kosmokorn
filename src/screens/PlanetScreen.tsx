import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IUserData, IPlanetData, IAppState } from "@/types"
import { isTouchDevice, getScreenSize } from "@/utils"
import Button from "@/components/ui/Button"
import Loading from "@/components/ui/Loading"
import Planet2D from "@/components/planet/Planet2D"
import SimpleLittlePlanet from "@/components/planet/SimpleLittlePlanet"
import PlanetInfo from "@/components/planet/PlanetInfo"
import seedrandom from "seedrandom"
import {
  FiInfo,
  FiSettings,
  FiBarChart2,
  FiZap,
  FiGitCommit,
  FiCalendar,
  FiEye,
  FiMonitor,
  FiStar,
  FiTrendingUp
} from "react-icons/fi"

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
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [isProcessingVisit, setIsProcessingVisit] = useState<boolean>(false)

  // Вычисляем индекс биома для согласованности 2D/3D
  const biomeIndex = useMemo(() => {
    const seed = userData?.seed ?? userData?.planetName ?? "default-seed"
    const rng = seedrandom(`${seed}-world`)
    return Math.floor(rng() * 6)
  }, [userData?.seed, userData?.planetName])

  // Определяем возможности устройства
  const deviceCapabilities = useMemo(() => {
    const screenSize = getScreenSize()
    const isMobile = isTouchDevice()
    const cores =
      typeof navigator !== "undefined" &&
      (navigator as { hardwareConcurrency: number }).hardwareConcurrency
        ? (navigator as { hardwareConcurrency: number }).hardwareConcurrency
        : 4
    const preferReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Разрешаем 3D на большинстве устройств, кроме совсем слабых
    const canHandle3D = !preferReduced && cores >= 2

    return {
      canHandle3D,
      preferReduced,
      isMobile,
      screenSize
    }
  }, [])

  // Если попытались включить 3D на слабом устройстве — откатываем в 2D
  useEffect(() => {
    if (!deviceCapabilities.canHandle3D && viewMode === "3d") {
      setViewMode("2d")
    }
  }, [deviceCapabilities.canHandle3D, viewMode])

  // Анимация планеты
  const isAnimating = !deviceCapabilities.preferReduced

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
      className="min-h-screen-mobile flex flex-col relative overflow-hidden bg-space-gradient"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Навигационная панель */}
      <motion.header
        className="safe-top flex items-center justify-between p-4 bg-dark-900/40 backdrop-blur-xl border-b border-dark-700/50"
        variants={itemVariants}>
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}>
          <div className="flex items-center gap-2">
            <FiStar className="text-brand-accent text-xl" />
            <h1 className="text-lg font-bold text-brand-light truncate">{userData.planetName}</h1>
          </div>
          <motion.div
            className="text-xs text-dark-500 bg-brand-primary/20 border border-brand-primary/30 px-3 py-1 rounded-full"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(142, 68, 173, 0.3)" }}>
            <FiCalendar className="inline mr-1" />
            День {planetData.currentDay}
          </motion.div>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Переключатель 2D/3D */}
          <motion.div
            className="flex bg-dark-800/60 backdrop-blur-sm rounded-xl p-1 border border-dark-700/60"
            whileHover={{ backgroundColor: "rgba(44, 42, 51, 0.8)" }}>
            <motion.button
              onClick={() => setViewMode("2d")}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                viewMode === "2d"
                  ? "bg-brand-primary text-white shadow-lg"
                  : "text-dark-500 hover:text-brand-light hover:bg-dark-700/60"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <FiEye />
              <span>2D</span>
            </motion.button>
            <motion.button
              onClick={() => deviceCapabilities.canHandle3D && setViewMode("3d")}
              disabled={!deviceCapabilities.canHandle3D}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                viewMode === "3d"
                  ? "bg-brand-secondary text-white shadow-lg"
                  : "text-dark-500 hover:text-brand-light hover:bg-dark-700/60"
              } ${!deviceCapabilities.canHandle3D ? "opacity-30 cursor-not-allowed" : ""}`}
              whileHover={deviceCapabilities.canHandle3D ? { scale: 1.05 } : {}}
              whileTap={deviceCapabilities.canHandle3D ? { scale: 0.95 } : {}}>
              <FiMonitor />
              <span>3D</span>
            </motion.button>
          </motion.div>

          {/* Кнопки действий */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowInfo(!showInfo)}
            icon={<FiInfo />}
            className="text-brand-light hover:text-brand-accent"
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onNavigate("settings")}
            icon={<FiSettings />}
            className="text-brand-light hover:text-brand-secondary"
          />
        </div>
      </motion.header>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Визуализация планеты */}
        <motion.div
          className="flex-1 flex items-center justify-center relative min-h-[60vh] lg:min-h-[70vh]"
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
                  userSeed={userData.seed ?? userData.planetName ?? "default-seed"}
                  biomeIndex={biomeIndex}
                  size={Math.min(window.innerWidth * 0.6, 300)}
                  animated={!deviceCapabilities.preferReduced}
                  showSatellites
                  showAtmosphere
                  onClick={() => !showInfo && setShowInfo(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="3d"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{ height: "calc(100vh - 200px)" }}>
                <SimpleLittlePlanet
                  userSeed={userData.seed ?? userData.planetName ?? "default-seed"}
                  day={planetData.currentDay}
                  events={planetData.events}
                  biomeIndex={biomeIndex}
                  stage={planetData.stage}
                  isAnimating={isAnimating}
                  showControls={true}
                  autoRotate={!deviceCapabilities.preferReduced}
                  isMobile={deviceCapabilities.isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Уведомление о новом дне */}
          <AnimatePresence>
            {isNewDay && daysPassed > 0 && (
              <motion.div
                className="absolute top-6 left-4 right-4 z-20"
                initial={{ opacity: 0, y: -100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -100, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-5 rounded-2xl shadow-2xl border border-brand-accent/30">
                  <div className="text-center">
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      ✨
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {daysPassed === 1 ? "Новый день начался!" : `Прошло ${daysPassed} дней!`}
                    </h3>
                    <p className="text-sm text-white/90 mb-4">
                      Ваша планета готова к новым открытиям и эволюции
                    </p>
                    <Button
                      size="md"
                      variant="secondary"
                      onClick={handleDailyVisit}
                      isLoading={isProcessingVisit}
                      fullWidth
                      icon={<FiTrendingUp />}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {isProcessingVisit ? "Эволюция в процессе..." : "🚀 Начать эволюцию"}
                    </Button>
                    {planetData.events.length > 0 && (
                      <motion.div
                        className="mt-4 p-3 bg-white/10 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}>
                        <p className="text-xs text-white/80">
                          <FiZap className="inline mr-1" />
                          Последнее событие: {planetData.events[planetData.events.length - 1].title}
                        </p>
                      </motion.div>
                    )}
                  </div>
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
          className="safe-bottom bg-dark-900/60 backdrop-blur-xl border-t border-dark-700/50 p-4"
          variants={itemVariants}>
          <div className="flex items-center justify-between gap-4">
            {/* Статистические карточки */}
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className="flex items-center gap-2 bg-dark-800/60 px-3 py-2 rounded-xl border border-dark-700/50"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(62, 59, 69, 0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}>
                <FiCalendar className="text-brand-secondary text-lg" />
                <div>
                  <div className="text-xs text-dark-500 font-medium">Серия</div>
                  <div className="text-sm font-bold text-brand-light">{currentStreak} дн.</div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-dark-800/60 px-3 py-2 rounded-xl border border-dark-700/50"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(62, 59, 69, 0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}>
                <FiGitCommit className="text-brand-primary text-lg" />
                <div>
                  <div className="text-xs text-dark-500 font-medium">Стадия</div>
                  <div className="text-sm font-bold text-brand-light capitalize">
                    {planetData.stage}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-dark-800/60 px-3 py-2 rounded-xl border border-dark-700/50"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(62, 59, 69, 0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}>
                <FiZap className="text-brand-accent text-lg" />
                <div>
                  <div className="text-xs text-dark-500 font-medium">События</div>
                  <div className="text-sm font-bold text-brand-light">
                    {planetData.events.length}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Кнопка ленты событий */}
            <Button
              size="md"
              variant="primary"
              onClick={() => onNavigate("events")}
              icon={<FiBarChart2 />}
              className="shrink-0">
              События
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PlanetScreen
