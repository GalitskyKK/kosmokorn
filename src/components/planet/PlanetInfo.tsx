import React from "react"
import { motion } from "framer-motion"
import { IPlanetData } from "@/types"
import { STAGE_INFO } from "@/constants"
import { formatTemperature, formatPercent, formatNumber, cn } from "@/utils"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import {
  FiThermometer,
  FiMoon,
  FiZap,
  FiWind,
  FiDroplet,
  FiTrendingUp,
  FiAward,
  FiCpu,
  FiLayers
} from "react-icons/fi"

interface IPlanetInfoProps {
  planetData: IPlanetData
  className?: string
  compact?: boolean
  animated?: boolean
}

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
  color: string
}> = ({ title, value, icon, subtitle, color }) => (
  <motion.div
    className="p-4 rounded-xl bg-dark-800 border border-dark-700/80"
    whileHover={{ scale: 1.03, backgroundColor: "#3E3B45" }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}>
    <div className="flex items-center gap-3">
      <div className={cn("text-2xl p-2 rounded-lg", color)}>{icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-dark-500">{title}</h4>
        <p className="text-lg font-bold text-brand-light">{value}</p>
        {subtitle && <p className="text-xs text-dark-500">{subtitle}</p>}
      </div>
    </div>
  </motion.div>
)

const ProgressBar: React.FC<{
  label: string
  value: number
  color: string
  icon: React.ReactNode
}> = ({ label, value, color, icon }) => {
  const progressBarVariants = {
    hidden: { width: "0%" },
    visible: {
      width: `${value * 100}%`,
      transition: { duration: 1, delay: 0.3, type: "spring" }
    }
  }

  return (
    <motion.div
      className="space-y-2"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 font-medium text-brand-light">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-dark-500">{formatPercent(value)}</span>
      </div>
      <div className="w-full bg-dark-800 rounded-full h-2.5">
        <motion.div
          className={cn("h-2.5 rounded-full", color)}
          variants={progressBarVariants}
          initial="hidden"
          animate="visible"
        />
      </div>
    </motion.div>
  )
}

/**
 * Компонент для отображения информации о планете
 */
const PlanetInfo: React.FC<IPlanetInfoProps> = ({ planetData, className, animated = true }) => {
  const stageInfo = STAGE_INFO[planetData.stage]

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.07
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial={animated ? "hidden" : "visible"}
      animate="visible">
      <Card variant="glass" padding="lg" animated={false}>
        <CardHeader>
          <motion.div
            className="text-center"
            variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}>
            <div className="text-6xl mb-4 drop-shadow-lg">{stageInfo.emoji}</div>
            <CardTitle as="h2" className="text-2xl mb-2 text-brand-light">
              {stageInfo.name}
            </CardTitle>
            <p className="text-dark-500 text-sm">{stageInfo.description}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-dark-800/50 border border-dark-700 rounded-full text-xs">
              <FiAward className="text-brand-accent" />
              <span>
                День {planetData.currentDay} • {formatNumber(planetData.evolution.evolutionPoints)}{" "}
                очков эволюции
              </span>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}>
            <StatCard
              title="Температура"
              value={formatTemperature(planetData.temperature)}
              icon={<FiThermometer />}
              color="bg-red-500/20 text-red-400"
            />
            <StatCard
              title="Спутники"
              value={planetData.satellites.length}
              icon={<FiMoon />}
              subtitle={planetData.satellites.length ? "активны" : "нет"}
              color="bg-purple-500/20 text-purple-400"
            />
            <StatCard
              title="События"
              value={planetData.events.length}
              icon={<FiZap />}
              subtitle="зафиксировано"
              color="bg-yellow-500/20 text-yellow-400"
            />
            <StatCard
              title="Формы жизни"
              value={planetData.lifeforms.length}
              icon={<FiCpu />}
              subtitle="видов"
              color="bg-green-500/20 text-green-400"
            />
          </motion.div>

          <div className="space-y-4">
            <ProgressBar
              label="Атмосфера"
              value={planetData.atmosphere}
              icon={<FiWind />}
              color="bg-gradient-to-r from-cyan-500 to-blue-500"
            />

            <ProgressBar
              label="Водные ресурсы"
              value={planetData.water}
              icon={<FiDroplet />}
              color="bg-gradient-to-r from-blue-400 to-indigo-500"
            />

            <ProgressBar
              label="Биосфера"
              value={planetData.life}
              icon={<FiLayers />}
              color="bg-gradient-to-r from-emerald-500 to-green-500"
            />

            <ProgressBar
              label="Прогресс эволюции"
              value={planetData.evolution.nextStageProgress}
              icon={<FiTrendingUp />}
              color="bg-gradient-to-r from-pink-500 to-purple-500"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PlanetInfo
