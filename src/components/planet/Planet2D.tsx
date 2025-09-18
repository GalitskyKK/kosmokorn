import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { IPlanetData, ISatellite } from "@/types"
import { STAGE_SIZES } from "@/constants"
import { cn } from "@/utils"

interface IPlanet2DProps {
  planetData: IPlanetData
  size?: number
  animated?: boolean
  showSatellites?: boolean
  showAtmosphere?: boolean
  className?: string
  onClick?: () => void
}

/**
 * 2D представление планеты для мобильных устройств
 * Легковесная альтернатива 3D версии
 */
const Planet2D: React.FC<IPlanet2DProps> = ({
  planetData,
  size = 200,
  animated = true,
  showSatellites = true,
  showAtmosphere = true,
  className,
  onClick
}) => {
  const planetStyle = useMemo(() => {
    // Увеличиваем минимальный размер для ранних стадий на мобильных
    const stageMultiplier = STAGE_SIZES[planetData.stage]
    const minSize = window.innerWidth <= 768 ? 80 : 60 // Минимальный размер для мобильных
    const baseSize = Math.max(size * stageMultiplier, minSize)

    return {
      width: `${baseSize}px`,
      height: `${baseSize}px`,
      backgroundColor: planetData.color
    }
  }, [planetData.stage, planetData.color, size])

  const atmosphereOpacity = useMemo(() => {
    return Math.min(planetData.atmosphere * 0.8, 0.6)
  }, [planetData.atmosphere])

  const planetVariants = {
    initial: { scale: 0, opacity: 0, rotate: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: animated ? 360 : 0,
      transition: {
        duration: animated ? 20 : 0.5,
        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
      }
    }
  }

  const glowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 3, repeat: Infinity }
    }
  }

  const renderSatellite = (satellite: ISatellite, index: number) => {
    const orbitSize = size + satellite.distance * 20
    const satelliteSize = Math.max(8, satellite.size * 30)

    // Кольца отображаются по-другому
    if (satellite.type === "ring") {
      return null // Кольца будут отображены отдельно
    }

    return (
      <motion.div
        key={satellite.id}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${orbitSize}px`,
          height: `${orbitSize}px`
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 10 + satellite.orbitSpeed * 5,
          repeat: Infinity,
          ease: "linear",
          delay: index * 2
        }}>
        {/* Орбита (показываем тонкую линию) */}
        <div
          className="absolute inset-0 rounded-full border border-white/20"
          style={{ borderWidth: "1px" }}
        />

        {/* Спутник */}
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 rounded-full"
          style={{
            width: `${satelliteSize}px`,
            height: `${satelliteSize}px`,
            backgroundColor: satellite.color
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2 + index,
            repeat: Infinity
          }}
        />
      </motion.div>
    )
  }

  const renderRings = () => {
    const rings = planetData.satellites.filter((s) => s.type === "ring")
    if (rings.length === 0) return null

    return rings.map((ring, index) => {
      const ringSize = size + ring.distance * 20
      const ringWidth = Math.max(4, ring.size * 10)

      return (
        <motion.div
          key={ring.id}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: `${ringSize}px`,
            height: `${ringSize}px`
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20 + ring.orbitSpeed * 10,
            repeat: Infinity,
            ease: "linear",
            delay: index * 3
          }}>
          {/* Кольцо */}
          <div
            className="absolute inset-0 rounded-full border"
            style={{
              borderWidth: `${ringWidth}px`,
              borderColor: `${ring.color}40`, // Прозрачность
              borderStyle: "solid"
            }}
          />
          {/* Внутреннее свечение кольца */}
          <div
            className="absolute inset-0 rounded-full border"
            style={{
              borderWidth: `${Math.max(1, ringWidth / 2)}px`,
              borderColor: `${ring.color}80`,
              borderStyle: "solid"
            }}
          />
        </motion.div>
      )
    })
  }

  const renderStageEffects = () => {
    switch (planetData.stage) {
      case "seed":
        return (
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )

      case "core":
        return (
          <>
            {/* Огненный эффект */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Лава */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${20 + i * 25}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7
                }}
              />
            ))}
          </>
        )

      case "atmosphere":
        return (
          showAtmosphere && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-sm"
              style={{
                transform: "scale(1.2)",
                opacity: atmosphereOpacity
              }}
              animate={{
                opacity: [atmosphereOpacity * 0.5, atmosphereOpacity, atmosphereOpacity * 0.5]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          )
        )

      case "surface":
        return (
          <>
            {/* Океаны */}
            {planetData.water > 0 && (
              <motion.div
                className="absolute inset-2 rounded-full bg-blue-500/40"
                animate={{
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            {/* Континенты */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-green-600/30 rounded-full"
                style={{
                  width: "30%",
                  height: "20%",
                  top: `${30 + i * 40}%`,
                  left: `${25 + i * 30}%`,
                  borderRadius: "50%"
                }}
              />
            ))}
          </>
        )

      case "life":
        return (
          <>
            {/* Биосфера */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400/20"
              animate={{
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            {/* Города/свечения жизни */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  top: `${25 + (i % 2) * 50}%`,
                  left: `${20 + Math.floor(i / 2) * 60}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.8
                }}
              />
            ))}
          </>
        )

      case "mature":
        return (
          <>
            {/* Развитая атмосфера */}
            {showAtmosphere && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 blur-sm"
                style={{ transform: "scale(1.3)" }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1.25, 1.35, 1.25]
                }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            )}
            {/* Технологическая цивилизация */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  top: `${15 + ((i * 15) % 70)}%`,
                  left: `${10 + ((i * 25) % 80)}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </>
        )

      default:
        return null
    }
  }

  const containerSize = useMemo(() => {
    // Рассчитываем размер контейнера с учетом спутников и атмосферы
    const stageMultiplier = STAGE_SIZES[planetData.stage]
    const minSize = window.innerWidth <= 768 ? 80 : 60
    const baseSize = Math.max(size * stageMultiplier, minSize)

    // Добавляем место для орбит спутников и эффектов
    const satelliteSpace = planetData.satellites.length > 0 ? 60 : 20
    const containerSize = baseSize + satelliteSpace * 2

    // Ограничиваем максимальный размер для мобильных
    const maxSize =
      window.innerWidth <= 768 ? Math.min(window.innerWidth * 0.9, containerSize) : containerSize

    return Math.max(containerSize, maxSize)
  }, [planetData.stage, planetData.satellites.length, size])

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "touch-none select-none",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`
      }}
      onClick={onClick}>
      {/* Космическое свечение */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${planetData.color}20 0%, transparent 70%)`,
            transform: "scale(1.8)"
          }}
          variants={glowVariants}
          animate="animate"
        />
      )}

      {/* Кольца (рендерим до планеты, чтобы они были на заднем плане) */}
      {showSatellites && renderRings()}

      {/* Спутники (рендерим до планеты, чтобы они были на заднем плане) */}
      {showSatellites &&
        planetData.satellites
          .filter((satellite) => satellite.type !== "ring")
          .map((satellite, index) => renderSatellite(satellite, index))}

      {/* Основная планета */}
      <motion.div
        className="relative rounded-full shadow-lg"
        style={planetStyle}
        variants={planetVariants}
        initial="initial"
        animate="animate">
        {/* Эффекты стадий */}
        {renderStageEffects()}

        {/* Основной градиент планеты */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${planetData.color}, ${planetData.color}dd, ${planetData.color}bb)`
          }}
        />

        {/* Тени и блики */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/30" />

        {/* Текстура поверхности */}
        <div className="absolute inset-0 rounded-full opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-black/10 rounded-full"
              style={{
                width: `${5 + Math.random() * 15}%`,
                height: `${5 + Math.random() * 15}%`,
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Информация о планете (опционально) */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}>
        <div className="text-xs text-center text-white/70 font-medium">
          День {planetData.currentDay}
        </div>
      </motion.div>
    </div>
  )
}

export default Planet2D
