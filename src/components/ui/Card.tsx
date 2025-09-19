import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

interface ICardProps {
  children: React.ReactNode
  className?: string
  animated?: boolean
  variant?: "default" | "glass" | "primary"
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
  const baseClasses = ["rounded-2xl transition-all duration-300", onClick && "cursor-pointer"]

  const variantClasses = {
    default: ["bg-dark-800", "border border-dark-700", "shadow-sm hover:shadow-md"],
    glass: [
      "bg-dark-900/40",
      "backdrop-blur-xl backdrop-saturate-150",
      "border border-dark-600/60",
      "shadow-lg"
    ],
    primary: [
      "bg-gradient-to-br from-brand-primary to-brand-secondary",
      "shadow-lg hover:shadow-xl",
      "border-0 text-white"
    ]
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
        whileHover: { y: -3, scale: 1.015 },
        whileTap: onClick ? { scale: 0.985 } : undefined,
        transition: { type: "spring", stiffness: 300, damping: 20 }
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
}> = ({ children, className }) => <div className={cn("mb-4", className)}>{children}</div>

export const CardTitle: React.FC<{
  children: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}> = ({ children, className, as: Component = "h3" }) => (
  <Component className={cn("text-lg mobile:text-xl font-bold", "leading-tight", className)}>
    {children}
  </Component>
)

export const CardDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <p className={cn("text-sm", "text-dark-500", "leading-relaxed", className)}>{children}</p>
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
        "mt-6 pt-4 border-t border-dark-700/50",
        "flex items-center gap-3",
        justifyClasses[justify],
        className
      )}>
      {children}
    </div>
  )
}

export default Card
