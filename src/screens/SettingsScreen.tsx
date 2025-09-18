import React, { useState } from "react"
import { motion } from "framer-motion"
import { IUserData, IAppState } from "@/types"
import { APP_VERSION, ACHIEVEMENTS } from "@/constants"
import { storage } from "@/services/storageService"
// import { formatNumber } from '@/utils' // Пока не используется
import Button from "@/components/ui/Button"
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"

interface ISettingsScreenProps {
  userData: IUserData | null
  onNavigate: (view: IAppState["currentView"]) => void
  onReset: () => void
  onSettingsUpdate: (settings: IUserData["settings"]) => void
  currentStreak: number
}

/**
 * Экран настроек приложения
 * Управление настройками, достижениями и данными пользователя
 */
const SettingsScreen: React.FC<ISettingsScreenProps> = ({
  userData,
  onNavigate,
  onReset,
  onSettingsUpdate,
  currentStreak
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false)
  const [showExportData, setShowExportData] = useState<boolean>(false)

  if (!userData) {
    return null
  }

  const handleSettingChange = (key: keyof IUserData["settings"], value: any): void => {
    const newSettings = { ...userData.settings, [key]: value }
    onSettingsUpdate(newSettings)
  }

  const handleExportData = (): void => {
    const exportedData = storage.export()
    if (exportedData) {
      const blob = new Blob([exportedData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kosmokorn-${userData.planetName}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowExportData(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const ToggleSwitch: React.FC<{
    label: string
    description?: string
    enabled: boolean
    onChange: (enabled: boolean) => void
    disabled?: boolean
  }> = ({ label, description, enabled, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
          ${enabled ? "bg-blue-600" : "bg-gray-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  )

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: string
    subtitle?: string
  }> = ({ title, value, icon, subtitle }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )

  return (
    <motion.div
      className="min-h-screen-mobile bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Заголовок */}
      <motion.header
        className="safe-top flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10"
        variants={itemVariants}>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("planet")}
            className="text-white">
            ← Назад
          </Button>
          <h1 className="text-lg font-semibold text-white">Настройки</h1>
        </div>
      </motion.header>

      <div className="flex-1 p-4 space-y-6">
        {/* Статистика пользователя */}
        <motion.div variants={itemVariants}>
          <Card variant="glassmorphism" padding="lg">
            <CardHeader>
              <CardTitle className="text-white text-center">{userData.planetName}</CardTitle>
              <p className="text-center text-gray-300 text-sm">
                День {userData.currentDay} • Всего визитов: {userData.totalVisits}
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 mobile:grid-cols-4 gap-4">
                <StatCard
                  title="Текущая серия"
                  value={currentStreak}
                  icon="🔥"
                  subtitle={currentStreak === 1 ? "день" : "дней"}
                />
                <StatCard
                  title="Достижения"
                  value={userData.achievements.length}
                  icon="🏆"
                  subtitle="получено"
                />
                <StatCard
                  title="Возраст планеты"
                  value={userData.currentDay}
                  icon="🌍"
                  subtitle={userData.currentDay === 1 ? "день" : "дней"}
                />
                <StatCard
                  title="Всего визитов"
                  value={userData.totalVisits}
                  icon="📅"
                  subtitle="раз"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Достижения */}
        {userData.achievements.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card variant="glassmorphism" padding="lg">
              <CardHeader>
                <CardTitle className="text-white">Достижения</CardTitle>
                <p className="text-gray-400 text-sm">Ваши космические награды</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {userData.achievements.map((achievementId) => {
                    const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS]
                    if (!achievement) return null

                    return (
                      <div
                        key={achievementId}
                        className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <div className="text-white font-medium">{achievement.name}</div>
                          <div className="text-xs text-gray-400">{achievement.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Настройки */}
        <motion.div variants={itemVariants}>
          <Card variant="glassmorphism" padding="lg">
            <CardHeader>
              <CardTitle className="text-white">Настройки приложения</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <ToggleSwitch
                  label="Звуковые эффекты"
                  description="Воспроизведение звуков в приложении"
                  enabled={userData.settings.enableSound}
                  onChange={(enabled) => handleSettingChange("enableSound", enabled)}
                />

                <ToggleSwitch
                  label="Анимации"
                  description="Плавные переходы и эффекты"
                  enabled={userData.settings.enableAnimations}
                  onChange={(enabled) => handleSettingChange("enableAnimations", enabled)}
                />

                <ToggleSwitch
                  label="Уведомления"
                  description="Push-уведомления о событиях"
                  enabled={userData.settings.notifications}
                  onChange={(enabled) => handleSettingChange("notifications", enabled)}
                />

                {/* Выбор темы */}
                <div className="py-3">
                  <div className="text-white font-medium mb-3">Тема оформления</div>
                  <div className="flex gap-2">
                    {(["space", "cosmic", "galaxy"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleSettingChange("theme", theme)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                          ${
                            userData.settings.theme === theme
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }
                        `}>
                        {theme === "space"
                          ? "Космос"
                          : theme === "cosmic"
                          ? "Космический"
                          : "Галактика"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Выбор языка */}
                <div className="py-3">
                  <div className="text-white font-medium mb-3">Язык</div>
                  <div className="flex gap-2">
                    {(["ru", "en"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleSettingChange("language", lang)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${
                            userData.settings.language === lang
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }
                        `}>
                        {lang === "ru" ? "🇷🇺 Русский" : "🇺🇸 English"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Управление данными */}
        <motion.div variants={itemVariants}>
          <Card variant="glassmorphism" padding="lg">
            <CardHeader>
              <CardTitle className="text-white">Управление данными</CardTitle>
              <p className="text-gray-400 text-sm">Экспорт, резервное копирование и сброс данных</p>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setShowExportData(true)}
                  className="text-white border-white/30">
                  📤 Экспортировать данные планеты
                </Button>

                <Button fullWidth variant="danger" onClick={() => setShowResetConfirm(true)}>
                  🗑️ Создать новую планету
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* О приложении */}
        <motion.div variants={itemVariants}>
          <Card variant="glassmorphism" padding="lg">
            <CardHeader>
              <CardTitle className="text-white">О KosmoKorn</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl">🌍</div>
                <p className="text-white font-medium">KosmoKorn v{APP_VERSION}</p>
                <p className="text-gray-400 text-sm">Выращивай свою персональную планету</p>
                <p className="text-gray-500 text-xs">Создано с ❤️ для любителей космоса</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Диалог подтверждения сброса */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <Card variant="glassmorphism" padding="lg">
              <CardHeader>
                <div className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <CardTitle className="text-white">Создать новую планету?</CardTitle>
                  <p className="text-gray-300 text-sm mt-2">
                    Это действие нельзя отменить. Вся история вашей планеты будет утеряна навсегда.
                  </p>
                </div>
              </CardHeader>

              <CardFooter justify="between">
                <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                  Отмена
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    onReset()
                    setShowResetConfirm(false)
                  }}>
                  Создать новую
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Диалог экспорта */}
      {showExportData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <Card variant="glassmorphism" padding="lg">
              <CardHeader>
                <div className="text-center">
                  <div className="text-4xl mb-4">📤</div>
                  <CardTitle className="text-white">Экспорт данных планеты</CardTitle>
                  <p className="text-gray-300 text-sm mt-2">
                    Сохраните данные вашей планеты в файл для резервного копирования или обмена.
                  </p>
                </div>
              </CardHeader>

              <CardFooter justify="between">
                <Button variant="ghost" onClick={() => setShowExportData(false)}>
                  Отмена
                </Button>
                <Button onClick={handleExportData}>Скачать файл</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default SettingsScreen
