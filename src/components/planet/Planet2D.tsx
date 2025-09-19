import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { IPlanetData, ISatellite } from "@/types"
import { STAGE_SIZES, STAGE_COLOR_GRADIENTS } from "@/constants"
import { cn } from "@/utils"
import seedrandom from "seedrandom"

interface IPlanet2DProps {
  planetData: IPlanetData
  size?: number
  animated?: boolean
  showSatellites?: boolean
  showAtmosphere?: boolean
  className?: string
  onClick?: () => void
  userSeed?: string
  biomeIndex?: number
}

/**
 * Красивое 2D представление планеты с мягкими градиентами
 * Оптимизировано для мобильных и эффективной производительности
 */
const Planet2D: React.FC<IPlanet2DProps> = ({
  planetData,
  size = 200,
  animated = true,
  showSatellites = true,
  showAtmosphere = true,
  className,
  onClick,
  userSeed,
  biomeIndex
}) => {
  // Палитра, согласованная с 3D-биомом для userSeed
  const colorPalette = useMemo(() => {
    if (!planetData || (!planetData.seed && !planetData.currentDay))
      return STAGE_COLOR_GRADIENTS[planetData.stage]
    const idx =
      typeof biomeIndex === "number"
        ? Math.max(0, Math.min(5, biomeIndex))
        : (() => {
            const baseSeed = (planetData as IPlanetData).seed ?? ""
            const useed = (userSeed ?? baseSeed) + "-world"
            const rng = seedrandom(useed)
            return Math.floor(rng() * 6)
          })()
    // Биомные палитры (primary/secondary/accent)
    const BIOME_2D = [
      { primary: "#417B2B", secondary: "#2e6c1f", accent: "#0f3f0e" }, // forest
      { primary: "#C2B280", secondary: "#B39B6E", accent: "#8E7A4E" }, // desert
      { primary: "#A7E8FF", secondary: "#7AD3FF", accent: "#5BC0FF" }, // ice
      { primary: "#1B6BB8", secondary: "#1F6AA5", accent: "#0F4B8A" }, // oceanic
      { primary: "#5A2D27", secondary: "#3D1F1C", accent: "#E25822" }, // volcanic
      { primary: "#6C5B7B", secondary: "#355C7D", accent: "#C06C84" } // alien
    ]
    const biomePalette = BIOME_2D[idx]
    // Для ранних стадий оставим stage-палитру
    if (
      planetData.stage === "seed" ||
      planetData.stage === "core" ||
      planetData.stage === "atmosphere"
    ) {
      return STAGE_COLOR_GRADIENTS[planetData.stage]
    }
    return biomePalette
  }, [planetData, userSeed, biomeIndex])

  const planetStyle = useMemo(() => {
    const stageMultiplier = STAGE_SIZES[planetData.stage]
    const minSize = window.innerWidth <= 768 ? 100 : 80
    const baseSize = Math.max(size * stageMultiplier, minSize)

    return {
      width: `${baseSize}px`,
      height: `${baseSize}px`,
      background:
        planetData.stage === "surface" ||
        planetData.stage === "life" ||
        planetData.stage === "mature"
          ? `radial-gradient(circle at 50% 50%, ${colorPalette.primary} 40%, ${colorPalette.secondary} 80%)` // Океан и континенты
          : `radial-gradient(circle at 30% 30%, ${colorPalette.primary} 0%, ${colorPalette.secondary} 40%, ${colorPalette.accent} 100%)`,
      // Более мягкие, мультяшные тени
      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.15), inset 0 4px 12px rgba(255, 255, 255, 0.4)`,
      filter: "drop-shadow(0 6px 20px rgba(0, 0, 0, 0.1))",
      border: `3px solid rgba(255, 255, 255, 0.2)` // Мягкая белая граница
    }
  }, [planetData.stage, size, colorPalette])

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
        // Быстрое появление (масштаб) и медленное вращение
        duration: animated ? 0.9 : 0.4,
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
        {/* Мягкая орбита */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            boxShadow: `inset 0 0 10px rgba(255, 255, 255, 0.1)`
          }}
        />

        {/* Красивый спутник */}
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 rounded-full"
          style={{
            width: `${satelliteSize}px`,
            height: `${satelliteSize}px`,
            background: `radial-gradient(circle, ${satellite.color} 0%, ${satellite.color}dd 70%, ${satellite.color}aa 100%)`,
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.3)`
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 2.5 + index * 0.5,
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
          {/* Красивое кольцо с градиентом */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${ringWidth}px solid transparent`,
              background: `conic-gradient(from 0deg, ${ring.color}60 0%, ${ring.color}30 25%, ${ring.color}60 50%, ${ring.color}30 75%, ${ring.color}60 100%) border-box`,
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude"
            }}
          />
          {/* Внутреннее свечение */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${Math.max(1, ringWidth / 3)}px solid ${ring.color}90`,
              filter: "blur(0.5px)"
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
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colorPalette.accent}60 0%, transparent 60%)`
              }}
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            {/* Большие яркие блестки */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  top: `${20 + (i % 3) * 30}%`,
                  left: `${15 + (i % 4) * 25}%`,
                  background: `radial-gradient(circle, ${colorPalette.primary} 0%, ${colorPalette.accent} 100%)`,
                  boxShadow: `0 0 8px ${colorPalette.primary}`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.3, 1.5, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              />
            ))}
          </>
        )

      case "core":
        return (
          <>
            {/* Яркое пульсирующее свечение лавы */}
            <motion.div
              className="absolute inset-1 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colorPalette.secondary}80 0%, ${colorPalette.accent}50 60%, transparent 100%)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            {/* Крупные лавовые пузыри */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  top: `${15 + (i % 3) * 35}%`,
                  left: `${10 + (i % 4) * 30}%`,
                  background: `radial-gradient(circle, ${colorPalette.primary} 0%, ${colorPalette.secondary} 100%)`,
                  boxShadow: `0 0 10px ${colorPalette.primary}`
                }}
                animate={{
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                  y: [0, -20, 0]
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

      case "atmosphere":
        return (
          showAtmosphere && (
            <>
              <motion.div
                className="absolute rounded-full blur-sm"
                style={{
                  inset: "-10%",
                  background: `radial-gradient(circle, ${colorPalette.primary}40 0%, ${colorPalette.accent}20 60%, transparent 100%)`,
                  opacity: atmosphereOpacity
                }}
                animate={{
                  opacity: [
                    atmosphereOpacity * 0.3,
                    atmosphereOpacity * 0.8,
                    atmosphereOpacity * 0.3
                  ],
                  scale: [1.15, 1.25, 1.15]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              {/* Облачные формации */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${15 + i * 5}%`,
                    height: `${10 + i * 3}%`,
                    top: `${20 + i * 25}%`,
                    left: `${15 + i * 20}%`,
                    background: `linear-gradient(90deg, ${colorPalette.primary}50 0%, transparent 100%)`,
                    filter: "blur(1px)"
                  }}
                  animate={{
                    x: ["0%", "10%", "0%"],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 6 + i,
                    repeat: Infinity
                  }}
                />
              ))}
            </>
          )
        )

      case "surface":
        return (
          <>
            {/* Мягкие океаны */}
            {planetData.water > 0 && (
              <motion.div
                className="absolute inset-3 rounded-full"
                style={{
                  background: `radial-gradient(ellipse, ${colorPalette.primary}60 0%, ${colorPalette.secondary}40 50%, transparent 100%)`
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}
            {/* Континентальные массы */}
            {Array.from({ length: 3 }).map((_, i) => {
              const angle = i * 120 * (Math.PI / 180)
              const radius = 25
              const x = 50 + radius * Math.cos(angle)
              const y = 50 + radius * Math.sin(angle)

              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${20 + i * 5}%`,
                    height: `${15 + i * 3}%`,
                    top: `${Math.max(10, Math.min(80, y))}%`,
                    left: `${Math.max(10, Math.min(80, x))}%`,
                    background: `linear-gradient(45deg, ${colorPalette.secondary}70 0%, ${colorPalette.accent}50 100%)`,
                    filter: "blur(0.5px)"
                  }}
                  animate={{
                    scale: [1, 1.03, 1]
                  }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity
                  }}
                />
              )
            })}
          </>
        )

      case "life":
        return (
          <>
            {/* Яркая живая биосфера */}
            <motion.div
              className="absolute inset-1 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colorPalette.secondary}50 0%, ${colorPalette.primary}30 60%, transparent 100%)`
              }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.12, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            {/* Милые цветочки и формы жизни */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45 * (Math.PI / 180)
              const radius = 15 + (i % 3) * 12
              const x = 50 + radius * Math.cos(angle)
              const y = 50 + radius * Math.sin(angle)

              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    width: "10px",
                    height: "10px",
                    top: `${Math.max(5, Math.min(90, y))}%`,
                    left: `${Math.max(5, Math.min(90, x))}%`,
                    background: `radial-gradient(circle, ${colorPalette.accent} 0%, ${colorPalette.secondary} 100%)`,
                    borderRadius: i % 2 === 0 ? "50%" : "20%",
                    boxShadow: `0 0 6px ${colorPalette.accent}`
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.3, 0.5],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                />
              )
            })}
          </>
        )

      case "mature":
        return (
          <>
            {/* Радужная развитая атмосфера */}
            {showAtmosphere && (
              <motion.div
                className="absolute rounded-full blur-sm"
                style={{
                  inset: "-15%",
                  background: `conic-gradient(from 0deg, ${colorPalette.primary}60 0%, ${colorPalette.secondary}50 33%, ${colorPalette.accent}60 66%, ${colorPalette.primary}60 100%)`
                }}
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  scale: [1.3, 1.5, 1.3],
                  rotate: [0, 360]
                }}
                transition={{
                  opacity: { duration: 6, repeat: Infinity },
                  scale: { duration: 6, repeat: Infinity },
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" }
                }}
              />
            )}
            {/* Яркие огоньки цивилизации */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30 * (Math.PI / 180)
              const radius = 10 + (i % 4) * 8
              const x = 50 + radius * Math.cos(angle)
              const y = 50 + radius * Math.sin(angle)

              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    top: `${Math.max(5, Math.min(90, y))}%`,
                    left: `${Math.max(5, Math.min(90, x))}%`,
                    background: `radial-gradient(circle, ${colorPalette.primary} 0%, ${colorPalette.accent} 100%)`,
                    boxShadow: `0 0 8px ${colorPalette.primary}`
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.3, 1.2, 0.3],
                    rotate: [0, 180]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              )
            })}
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
      {/* Красивое космическое свечение */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colorPalette.secondary}25 0%, ${colorPalette.primary}15 40%, transparent 70%)`,
            transform: "scale(2)",
            filter: "blur(8px)"
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

        {/* Мягкий градиент уже применен через planetStyle */}

        {/* Мультяшные блики и тени */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/15" />

        {/* Большой мягкий блик сверху */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/60 blur-sm" />

        {/* Дополнительный внутренний блик */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/25 to-transparent" />

        {/* Мягкая текстура поверхности */}
        <div className="absolute inset-0 rounded-full opacity-20">
          {Array.from({ length: 6 }).map((_, i) => {
            // Детерминированные позиции для согласованности
            const angle = i * 60 * (Math.PI / 180)
            const radius = 30 + (i % 3) * 15
            const x = 50 + radius * Math.cos(angle)
            const y = 50 + radius * Math.sin(angle)

            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${8 + (i % 3) * 4}%`,
                  height: `${8 + (i % 3) * 4}%`,
                  top: `${Math.max(5, Math.min(85, y))}%`,
                  left: `${Math.max(5, Math.min(85, x))}%`,
                  background: `radial-gradient(circle, ${colorPalette.accent}40 0%, transparent 70%)`
                }}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Мягкая информация о планете */}
      <motion.div
        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}>
        <div className="text-xs text-center font-medium">
          <div
            className="px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${colorPalette.primary}40 0%, ${colorPalette.secondary}30 100%)`,
              border: `1px solid ${colorPalette.accent}50`,
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
            }}>
            День {planetData.currentDay}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Planet2D
