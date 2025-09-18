import React from "react"
import { motion } from "framer-motion"
import { IPlanetData } from "@/types"
import { STAGE_INFO } from "@/constants"
import { formatTemperature, formatPercent, formatNumber, cn } from "@/utils"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

interface IPlanetInfoProps {
  planetData: IPlanetData
  className?: string
  compact?: boolean
  animated?: boolean
}

/**
 * Компонент для отображения информации о планете
 * Адаптивный дизайн с mobile-first подходом
 */
const PlanetInfo: React.FC<IPlanetInfoProps> = ({
  planetData,
  className,
  compact = false,
  animated = true
}) => {
  const stageInfo = STAGE_INFO[planetData.stage]

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  const progressBarVariants = {
    hidden: { width: "0%" },
    visible: (value: number) => ({
      width: `${value * 100}%`,
      transition: { duration: 1, delay: 0.3 }
    })
  }

  const ProgressBar: React.FC<{
    label: string
    value: number
    color: string
    unit?: string
  }> = ({ label, value, color, unit = "" }) => (
    <motion.div className="space-y-2" variants={itemVariants}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {typeof value === "number"
            ? unit
              ? `${value.toFixed(1)}${unit}`
              : formatPercent(value)
            : value}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={cn("h-2 rounded-full", color)}
          variants={progressBarVariants}
          initial="hidden"
          animate="visible"
          custom={typeof value === "number" && value <= 1 ? value : 1}
        />
      </div>
    </motion.div>
  )

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: string
    subtitle?: string
  }> = ({ title, value, icon, subtitle }) => (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-gray-50 to-gray-100",
        "dark:from-gray-800 dark:to-gray-900",
        "p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      )}
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )

  if (compact) {
    return (
      <motion.div
        className={cn("space-y-4", className)}
        variants={containerVariants}
        initial={animated ? "hidden" : "visible"}
        animate="visible">
        {/* Заголовок стадии */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="text-4xl mb-2">{stageInfo.emoji}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stageInfo.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">День {planetData.currentDay}</p>
        </motion.div>

        {/* Основные показатели */}
        <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Температура</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTemperature(planetData.temperature)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Атмосфера</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatPercent(planetData.atmosphere)}
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial={animated ? "hidden" : "visible"}
      animate="visible">
      <Card variant="glassmorphism" padding="lg" animated={animated}>
        <CardHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">{stageInfo.emoji}</div>
            <CardTitle as="h2" className="text-xl mobile:text-2xl mb-2">
              {stageInfo.name}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm mobile:text-base">
              {stageInfo.description}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mobile:text-sm mt-2">
              День {planetData.currentDay} • {formatNumber(planetData.evolution.evolutionPoints)}{" "}
              очков эволюции
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Статистические карточки */}
          <div className="grid grid-cols-2 mobile:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Температура"
              value={formatTemperature(planetData.temperature)}
              icon="🌡️"
            />
            <StatCard
              title="Спутники"
              value={planetData.satellites.length}
              icon="🌙"
              subtitle={planetData.satellites.length ? "активны" : "отсутствуют"}
            />
            <StatCard
              title="События"
              value={planetData.events.length}
              icon="⭐"
              subtitle="наблюдалось"
            />
            <StatCard
              title="Жизнь"
              value={planetData.lifeforms.length}
              icon="🧬"
              subtitle="видов"
            />
          </div>

          {/* Прогресс-бары */}
          <div className="space-y-4">
            <ProgressBar
              label="Атмосфера"
              value={planetData.atmosphere}
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />

            <ProgressBar
              label="Водные ресурсы"
              value={planetData.water}
              color="bg-gradient-to-r from-blue-400 to-blue-600"
            />

            <ProgressBar
              label="Биосфера"
              value={planetData.life}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />

            <ProgressBar
              label="Прогресс эволюции"
              value={planetData.evolution.nextStageProgress}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>

          {/* Ресурсы планеты */}
          {planetData.resources && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              variants={itemVariants}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Ресурсы планеты
              </h4>
              <div className="grid grid-cols-2 mobile:grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>💎</div>
                  <div className="font-medium">Минералы</div>
                  <div className="text-gray-500">
                    {formatPercent(planetData.resources.minerals)}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>💨</div>
                  <div className="font-medium">Газы</div>
                  <div className="text-gray-500">{formatPercent(planetData.resources.gases)}</div>
                </div>
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>💧</div>
                  <div className="font-medium">Вода</div>
                  <div className="text-gray-500">{formatPercent(planetData.resources.water)}</div>
                </div>
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>⚡</div>
                  <div className="font-medium">Энергия</div>
                  <div className="text-gray-500">{formatPercent(planetData.resources.energy)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PlanetInfo
