import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

interface ICardProps {
  children: React.ReactNode
  className?: string
  animated?: boolean
  variant?: "default" | "glassmorphism" | "elevated"
  padding?: "none" | "sm" | "md" | "lg"
  onClick?: () => void
  as?: "div" | "article" | "section"
}

/**
 * Карточка с поддержкой различных стилей и анимаций
 * Адаптивный дизайн для мобильных устройств
 */
const Card: React.FC<ICardProps> = ({
  children,
  className,
  animated = false,
  variant = "default",
  padding = "md",
  onClick,
  as = "div"
}) => {
  const baseClasses = ["rounded-xl transition-all duration-200", onClick && "cursor-pointer"]

  const variantClasses = {
    default: [
      "bg-white dark:bg-gray-800",
      "border border-gray-200 dark:border-gray-700",
      "shadow-sm hover:shadow-md"
    ],
    glassmorphism: [
      "bg-white/10 dark:bg-gray-900/20",
      "backdrop-blur-lg backdrop-saturate-150",
      "border border-white/20 dark:border-gray-700/50",
      "shadow-xl"
    ],
    elevated: ["bg-white dark:bg-gray-800", "shadow-lg hover:shadow-xl", "border-0"]
  }

  const paddingClasses = {
    none: "",
    sm: "p-3 mobile:p-4",
    md: "p-4 mobile:p-6",
    lg: "p-6 mobile:p-8"
  }

  const allClasses = cn(baseClasses, variantClasses[variant], paddingClasses[padding], className)

  const Component = animated ? motion.div : as

  const animationProps = animated
    ? {
        whileHover: { y: -2, scale: 1.01 },
        whileTap: onClick ? { scale: 0.99 } : undefined,
        transition: { duration: 0.2, ease: "easeOut" }
      }
    : {}

  return (
    <Component className={allClasses} onClick={onClick} {...animationProps}>
      {children}
    </Component>
  )
}

// Подкомпоненты для структурирования контента карточки
export const CardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn("mb-4 mobile:mb-6", className)}>{children}</div>
)

export const CardTitle: React.FC<{
  children: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}> = ({ children, className, as: Component = "h3" }) => (
  <Component
    className={cn(
      "text-lg mobile:text-xl font-semibold",
      "text-gray-900 dark:text-white",
      "leading-tight",
      className
    )}>
    {children}
  </Component>
)

export const CardDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <p
    className={cn(
      "text-sm mobile:text-base",
      "text-gray-600 dark:text-gray-400",
      "leading-relaxed",
      className
    )}>
    {children}
  </p>
)

export const CardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => <div className={cn("space-y-4", className)}>{children}</div>

export const CardFooter: React.FC<{
  children: React.ReactNode
  className?: string
  justify?: "start" | "center" | "end" | "between"
}> = ({ children, className, justify = "end" }) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between"
  }

  return (
    <div
      className={cn(
        "mt-6 pt-4 border-t border-gray-200 dark:border-gray-700",
        "flex items-center gap-3",
        justifyClasses[justify],
        className
      )}>
      {children}
    </div>
  )
}

export default Card
