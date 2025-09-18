import React, { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils"

interface IInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string
  helper?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
  fullWidth?: boolean
  animated?: boolean
}

/**
 * Компонент ввода с поддержкой валидации и анимаций
 * Mobile-first дизайн с адаптивными размерами
 */
const Input = forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      label,
      error,
      helper,
      size = "md",
      variant = "default",
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      animated = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`

    const containerClasses = cn("relative", fullWidth && "w-full")

    const baseInputClasses = [
      "block transition-all duration-200",
      "border rounded-lg",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500"
    ]

    const variantClasses = {
      default: [
        "bg-white dark:bg-gray-800",
        "border-gray-300 dark:border-gray-600",
        "text-gray-900 dark:text-white",
        "focus:border-blue-500 focus:ring-blue-500/20",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      ],
      ghost: [
        "bg-transparent",
        "border-transparent",
        "text-gray-900 dark:text-white",
        "focus:bg-gray-50 dark:focus:bg-gray-800",
        "focus:border-gray-300 focus:ring-gray-300/20"
      ],
      outline: [
        "bg-transparent",
        "border-2 border-gray-300 dark:border-gray-600",
        "text-gray-900 dark:text-white",
        "focus:border-blue-500 focus:ring-blue-500/20",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      ]
    }

    const sizeClasses = {
      sm: ["h-9 px-3 text-sm", leftIcon && "pl-9", rightIcon && "pr-9"],
      md: ["h-11 px-4 text-base mobile:h-12", leftIcon && "pl-10", rightIcon && "pr-10"],
      lg: ["h-12 px-5 text-lg mobile:h-14", leftIcon && "pl-12", rightIcon && "pr-12"]
    }

    const widthClasses = fullWidth ? "w-full" : ""

    const inputClasses = cn(
      baseInputClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    )

    const iconClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const iconPositionClasses = {
      left: {
        sm: "left-2.5",
        md: "left-3",
        lg: "left-4"
      },
      right: {
        sm: "right-2.5",
        md: "right-3",
        lg: "right-4"
      }
    }

    const renderIcon = (icon: React.ReactNode, position: "left" | "right") => (
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center",
          "text-gray-400 dark:text-gray-500",
          "pointer-events-none",
          iconPositionClasses[position][size]
        )}>
        <div className={iconClasses[size]}>{icon}</div>
      </div>
    )

    const renderLoadingSpinner = () => (
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center",
          iconPositionClasses.right[size]
        )}>
        <div className={cn("animate-spin", iconClasses[size])}>
          <svg fill="none" viewBox="0 0 24 24">
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
      </div>
    )

    if (animated) {
      return (
        <div className={containerClasses}>
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block text-sm font-medium mb-2",
                "text-gray-700 dark:text-gray-300",
                error && "text-red-600 dark:text-red-400"
              )}>
              {label}
            </label>
          )}

          <div className="relative">
            {leftIcon && renderIcon(leftIcon, "left")}

            <motion.input
              ref={ref}
              id={inputId}
              className={inputClasses}
              disabled={disabled || isLoading}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
              {...(props as any)}
            />

            {isLoading ? renderLoadingSpinner() : rightIcon && renderIcon(rightIcon, "right")}
          </div>

          {(error || helper) && (
            <div className="mt-2 text-sm">
              {error ? (
                <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              ) : (
                helper && <p className="text-gray-600 dark:text-gray-400">{helper}</p>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2",
              "text-gray-700 dark:text-gray-300",
              error && "text-red-600 dark:text-red-400"
            )}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && renderIcon(leftIcon, "left")}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled || isLoading}
            {...props}
          />

          {isLoading ? renderLoadingSpinner() : rightIcon && renderIcon(rightIcon, "right")}
        </div>

        {(error || helper) && (
          <div className="mt-2 text-sm">
            {error ? (
              <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            ) : (
              helper && <p className="text-gray-600 dark:text-gray-400">{helper}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
