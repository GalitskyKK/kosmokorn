import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

// Типы кнопок
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon"

interface IButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  animated?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Универсальная кнопка с поддержкой анимаций
 * Mobile-first дизайн с адаптивными размерами
 */
const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  animated = true,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = [
    "inline-flex items-center justify-center font-bold rounded-xl",
    "transition-all duration-300",
    "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-900",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "active:scale-95 touch-manipulation"
  ]

  const variantClasses = {
    primary: [
      "bg-gradient-to-r from-brand-primary to-brand-secondary",
      "text-white shadow-lg shadow-brand-primary/30",
      "hover:shadow-xl hover:shadow-brand-secondary/30",
      "focus:ring-brand-primary/50",
      "disabled:from-dark-600 disabled:to-dark-700"
    ],
    secondary: [
      "bg-dark-700 text-brand-light",
      "border border-dark-600",
      "hover:bg-dark-600 hover:border-dark-500",
      "focus:ring-dark-500"
    ],
    outline: [
      "bg-transparent text-brand-secondary",
      "border-2 border-brand-secondary",
      "hover:bg-brand-secondary/10",
      "focus:ring-brand-secondary/50"
    ],
    ghost: ["bg-transparent text-brand-light", "hover:bg-dark-700/60", "focus:ring-dark-600"],
    danger: [
      "bg-red-600 text-white",
      "hover:bg-red-700",
      "focus:ring-red-500/50",
      "disabled:bg-red-400/50"
    ]
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[38px] rounded-lg",
    md: "px-5 py-2.5 text-base min-h-[46px]",
    lg: "px-6 py-3 text-lg min-h-[54px]",
    xl: "px-8 py-4 text-xl min-h-[62px]",
    icon: "h-11 w-11 text-xl"
  }

  const widthClasses = fullWidth ? "w-full" : ""

  const allClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  )

  const renderIcon = (position: "left" | "right") => {
    if (!icon || iconPosition !== position) return null

    return (
      <motion.span
        className={cn(
          "flex items-center",
          children && position === "left" && "mr-2",
          children && position === "right" && "ml-2"
        )}
        initial={{ opacity: 0, x: position === "left" ? -5 : 5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}>
        {icon}
      </motion.span>
    )
  }

  const renderLoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const motionProps = animated
    ? {
        whileHover: { y: -2, scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring", stiffness: 400, damping: 15 }
      }
    : {}

  return (
    <motion.button
      className={allClasses}
      disabled={disabled || isLoading}
      {...motionProps}
      {...(props as any)}>
      {isLoading && renderLoadingSpinner()}
      {renderIcon("left")}
      {children}
      {renderIcon("right")}
    </motion.button>
  )
}

export default Button
