import { Component, ErrorInfo, ReactNode } from "react"
import { motion } from "framer-motion"
import Button from "./ui/Button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Error Boundary для перехвата и обработки ошибок React
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-space-gradient flex items-center justify-center p-4">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className="text-8xl mb-6"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}>
              🌌
            </motion.div>

            <h1 className="text-2xl font-bold text-brand-light mb-3">Космическая аномалия!</h1>

            <p className="text-dark-500 mb-6 leading-relaxed">
              Произошла неожиданная ошибка в пространственно-временном континууме. Наши инженеры уже
              работают над исправлением.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-red-400 cursor-pointer mb-2">
                  Техническая информация
                </summary>
                <pre className="text-xs text-red-300 bg-red-900/20 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <Button variant="primary" onClick={this.handleReset} fullWidth size="lg">
                🔄 Попробовать снова
              </Button>

              <Button variant="secondary" onClick={this.handleReload} fullWidth>
                🚀 Перезапустить приложение
              </Button>
            </div>

            <p className="text-xs text-dark-500 mt-6">
              Если проблема повторяется, попробуйте очистить данные браузера
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
