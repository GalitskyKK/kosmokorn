import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

// Типы кнопок
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg" | "xl"

interface IButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  animated?: boolean
  className?: string
  children: React.ReactNode
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
    "inline-flex items-center justify-center",
    "font-medium rounded-lg",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "active:scale-95 touch-manipulation"
  ]

  const variantClasses = {
    primary: [
      "bg-gradient-to-r from-blue-600 to-purple-600",
      "text-white shadow-lg shadow-blue-500/25",
      "hover:from-blue-700 hover:to-purple-700",
      "focus:ring-blue-500",
      "disabled:from-gray-400 disabled:to-gray-500"
    ],
    secondary: [
      "bg-gray-800 text-white",
      "border border-gray-700",
      "hover:bg-gray-700 hover:border-gray-600",
      "focus:ring-gray-600"
    ],
    outline: [
      "bg-transparent text-blue-600",
      "border-2 border-blue-600",
      "hover:bg-blue-50 hover:text-blue-700",
      "focus:ring-blue-500",
      "dark:text-blue-400 dark:border-blue-400",
      "dark:hover:bg-blue-950/20"
    ],
    ghost: [
      "bg-transparent text-gray-700",
      "hover:bg-gray-100",
      "focus:ring-gray-400",
      "dark:text-gray-300 dark:hover:bg-gray-800"
    ],
    danger: [
      "bg-red-600 text-white",
      "hover:bg-red-700",
      "focus:ring-red-500",
      "disabled:bg-red-400"
    ]
  }

  const sizeClasses = {
    sm: ["px-3 py-2 text-sm min-h-[36px]", "mobile:px-4"],
    md: ["px-4 py-3 text-base min-h-[44px]", "mobile:px-6"],
    lg: ["px-6 py-4 text-lg min-h-[52px]", "mobile:px-8"],
    xl: ["px-8 py-5 text-xl min-h-[60px]", "mobile:px-10"]
  }

  const widthClasses = fullWidth ? ["w-full"] : []

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
      <span
        className={cn(
          "flex items-center",
          children && position === "left" && "mr-2",
          children && position === "right" && "ml-2"
        )}>
        {icon}
      </span>
    )
  }

  const renderLoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
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

  if (animated) {
    return (
      <motion.button
        className={allClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...(props as any)}>
        {isLoading && renderLoadingSpinner()}
        {renderIcon("left")}
        {children}
        {renderIcon("right")}
      </motion.button>
    )
  }

  return (
    <button className={allClasses} disabled={disabled || isLoading} {...props}>
      {isLoading && renderLoadingSpinner()}
      {renderIcon("left")}
      {children}
      {renderIcon("right")}
    </button>
  )
}

export default Button
