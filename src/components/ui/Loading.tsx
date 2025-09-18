import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

interface ILoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "orbit" | "cosmic"
  className?: string
  text?: string
  fullScreen?: boolean
  color?: "primary" | "secondary" | "white"
}

/**
 * Компонент загрузки с космической анимацией
 * Поддерживает различные варианты анимаций
 */
const Loading: React.FC<ILoadingProps> = ({
  size = "md",
  variant = "cosmic",
  className,
  text,
  fullScreen = false,
  color = "primary"
}) => {
  const sizeClasses = {
    sm: { container: "w-4 h-4", text: "text-sm" },
    md: { container: "w-8 h-8", text: "text-base" },
    lg: { container: "w-12 h-12", text: "text-lg" },
    xl: { container: "w-16 h-16", text: "text-xl" }
  }

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-purple-600",
    white: "text-white"
  }

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullScreen && "fixed inset-0 bg-black/50 backdrop-blur-sm z-50",
    !fullScreen && "p-4",
    className
  )

  const loadingClasses = cn(sizeClasses[size].container, colorClasses[color])

  const textClasses = cn(sizeClasses[size].text, colorClasses[color], "font-medium animate-pulse")

  const renderSpinner = () => (
    <div className={loadingClasses}>
      <svg
        className="animate-spin w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )

  const renderDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "rounded-full",
            size === "sm" && "w-2 h-2",
            size === "md" && "w-3 h-3",
            size === "lg" && "w-4 h-4",
            size === "xl" && "w-6 h-6",
            colorClasses[color].replace("text-", "bg-")
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <motion.div
      className={cn(
        "rounded-full border-2",
        loadingClasses,
        colorClasses[color].replace("text-", "border-")
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.6, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  )

  const renderOrbit = () => (
    <div className={cn("relative", loadingClasses)}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-current"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-transparent border-r-current opacity-60"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border-2 border-transparent border-b-current opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )

  const renderCosmic = () => (
    <div className={cn("relative", loadingClasses)}>
      {/* Центральная планета */}
      <motion.div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "w-2 h-2 rounded-full",
          colorClasses[color].replace("text-", "bg-")
        )}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />

      {/* Орбиты */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-current opacity-20"
          style={{
            transform: `scale(${0.6 + i * 0.2})`
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear"
          }}>
          {/* Спутники */}
          <motion.div
            className={cn(
              "absolute w-1 h-1 rounded-full -top-0.5",
              "left-1/2 transform -translate-x-1/2",
              colorClasses[color].replace("text-", "bg-"),
              i === 0 && "opacity-80",
              i === 1 && "opacity-60",
              i === 2 && "opacity-40"
            )}
            animate={{
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 1 + i * 0.5,
              repeat: Infinity
            }}
          />
        </motion.div>
      ))}

      {/* Космическая пыль */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-0.5 h-0.5 rounded-full",
              colorClasses[color].replace("text-", "bg-")
            )}
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 45}deg) translateY(-${20 + Math.random() * 10}px)`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )

  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return renderSpinner()
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "orbit":
        return renderOrbit()
      case "cosmic":
        return renderCosmic()
      default:
        return renderCosmic()
    }
  }

  return (
    <div className={containerClasses}>
      {renderLoading()}
      {text && (
        <motion.p
          className={textClasses}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Компонент для скелетона загрузки
export const LoadingSkeleton: React.FC<{
  className?: string
  lines?: number
  variant?: "text" | "card" | "avatar" | "button"
}> = ({ className, lines = 3, variant = "text" }) => {
  const renderVariant = () => {
    switch (variant) {
      case "text":
        return (
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse",
                  i === lines - 1 && "w-3/4" // Последняя строка короче
                )}
              />
            ))}
          </div>
        )
      case "card":
        return (
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </div>
          </div>
        )
      case "avatar":
        return (
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
        )
      case "button":
        return <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      default:
        return renderVariant()
    }
  }

  return <div className={className}>{renderVariant()}</div>
}

export default Loading
