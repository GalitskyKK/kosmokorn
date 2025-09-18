import React, { useState } from "react"
import { motion } from "framer-motion"
import { IUserData, IPlanetData, IAppState } from "@/types"
// import { MESSAGES } from '@/constants' // Пока не используется
import { validatePlanetName } from "@/utils"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

interface IWelcomeScreenProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onNavigate: (view: IAppState["currentView"]) => void
  onCreatePlanet: (planetName: string) => Promise<void>
  isNewDay: boolean
  daysPassed: number
  currentStreak: number
  isPlanetLoading: boolean
  planetError: string | null
}

/**
 * Экран приветствия и создания новой планеты
 * Первый экран, который видит пользователь
 */
const WelcomeScreen: React.FC<IWelcomeScreenProps> = ({ onCreatePlanet }) => {
  const [planetName, setPlanetName] = useState<string>("")
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [showNameInput, setShowNameInput] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    const validation = validatePlanetName(planetName)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    try {
      setIsCreating(true)
      setError("")
      await onCreatePlanet(planetName)
    } catch (error) {
      setError("Ошибка создания планеты. Попробуйте снова.")
    } finally {
      setIsCreating(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const starsVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className="min-h-screen-mobile flex flex-col items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Анимированный фон со звездами */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            variants={starsVariants}
            animate="animate"
            transition={{
              delay: Math.random() * 4,
              duration: 3 + Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 w-full max-w-md">
        {!showNameInput ? (
          // Экран приветствия
          <motion.div className="text-center space-y-8" variants={itemVariants}>
            {/* Заголовок */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.div
                className="text-8xl mobile:text-9xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}>
                🌱
              </motion.div>

              <h1 className="text-4xl mobile:text-5xl font-bold text-white mb-4">
                <motion.span
                  className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}>
                  KosmoKorn
                </motion.span>
              </h1>

              <p className="text-lg mobile:text-xl text-gray-300 leading-relaxed">
                Выращивай свою персональную планету из семени до целого мира
              </p>
            </motion.div>

            {/* Особенности */}
            <motion.div className="space-y-4 text-gray-400" variants={itemVariants}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <span className="text-sm mobile:text-base">Уникальная эволюция каждый день</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <span className="text-sm mobile:text-base">Космические события и чудеса</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧬</span>
                <span className="text-sm mobile:text-base">Развитие жизни и цивилизации</span>
              </div>
            </motion.div>

            {/* Кнопка начала */}
            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                fullWidth
                animated
                onClick={() => setShowNameInput(true)}
                className="text-lg font-semibold">
                🚀 Создать планету
              </Button>
            </motion.div>

            {/* Дополнительная информация */}
            <motion.p className="text-xs text-gray-500 leading-relaxed" variants={itemVariants}>
              Каждая планета уникальна и развивается на основе вашего выбора имени. Возвращайтесь
              каждый день, чтобы увидеть новые изменения!
            </motion.p>
          </motion.div>
        ) : (
          // Форма создания планеты
          <Card variant="glassmorphism" padding="lg" animated>
            <CardHeader>
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  🌟
                </motion.div>
                <CardTitle className="text-white text-xl mobile:text-2xl">
                  Назови свою планету
                </CardTitle>
                <p className="text-gray-300 text-sm mobile:text-base mt-2">
                  Имя определит уникальность вашего мира
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  value={planetName}
                  onChange={(e) => {
                    setPlanetName(e.target.value)
                    setError("")
                  }}
                  placeholder="Например: Терра Нова"
                  label="Имя планеты"
                  error={error}
                  size="lg"
                  fullWidth
                  disabled={isCreating}
                  leftIcon={<span>🌍</span>}
                  maxLength={20}
                  autoFocus
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      setShowNameInput(false)
                      setPlanetName("")
                      setError("")
                    }}
                    disabled={isCreating}
                    className="flex-1">
                    Назад
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isCreating}
                    disabled={!planetName.trim() || isCreating}
                    className="flex-2"
                    fullWidth>
                    {isCreating ? "Создание..." : "✨ Создать"}
                  </Button>
                </div>

                {/* Подсказки */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>💡 Советы по названию:</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Используйте 2-20 символов</li>
                    <li>• Только буквы, цифры и пробелы</li>
                    <li>• Имя влияет на развитие планеты</li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Версия приложения */}
      <motion.div
        className="absolute bottom-4 left-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}>
        KosmoKorn v1.0.0
      </motion.div>
    </motion.div>
  )
}

export default WelcomeScreen
