import React, { useState } from "react"
import { motion } from "framer-motion"
import { IUserData, IAppState, IPlanetData, IUserSettings } from "@/types"
import { APP_VERSION } from "@/constants"
import { storage } from "@/services/storageService"
import Button from "@/components/ui/Button"
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"

interface ISettingsScreenProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onNavigate: (view: IAppState["currentView"]) => void
  onReset: () => void
  onSettingsUpdate: (newSettings: IUserSettings) => void
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

  if (!userData) {
    return null
  }

  const handleSettingChange = (key: keyof IUserSettings, value: any): void => {
    if (!userData) return
    const newSettings = { ...userData.settings, [key]: value }
    onSettingsUpdate(newSettings)
  }

  const handleExportData = (): void => {
    const exportedData = storage.export()
    if (exportedData) {
      const blob = new Blob([exportedData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${userData.planetName}-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleResetData = (): void => {
    setShowResetConfirm(false)
    onReset()
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

  return (
    <motion.div
      className="min-h-screen-mobile p-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Шапка */}
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-brand-light">Настройки</h1>
          <p className="text-dark-500">Управление приложением и данными</p>
        </div>
        <Button variant="ghost" onClick={() => onNavigate("planet")} className="text-brand-light">
          ← Назад
        </Button>
      </motion.div>

      {/* Основные настройки */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-brand-light">Основные настройки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Тема */}
              <div className="flex justify-between items-center">
                <label className="text-brand-light">Тема</label>
                <select
                  value={userData.settings.theme}
                  onChange={(e) =>
                    handleSettingChange("theme", e.target.value as "space" | "cosmic" | "galaxy")
                  }
                  className="bg-dark-800 text-brand-light border border-dark-700 rounded-lg px-3 py-2">
                  <option value="space">Космос</option>
                  <option value="cosmic">Космический</option>
                  <option value="galaxy">Галактика</option>
                </select>
              </div>

              {/* Звук */}
              <div className="flex justify-between items-center">
                <label className="text-brand-light">Звуки</label>
                <input
                  type="checkbox"
                  checked={userData.settings.enableSound}
                  onChange={(e) => handleSettingChange("enableSound", e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              {/* Анимации */}
              <div className="flex justify-between items-center">
                <label className="text-brand-light">Анимации</label>
                <input
                  type="checkbox"
                  checked={userData.settings.enableAnimations}
                  onChange={(e) => handleSettingChange("enableAnimations", e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              {/* Уведомления */}
              <div className="flex justify-between items-center">
                <label className="text-brand-light">Уведомления</label>
                <input
                  type="checkbox"
                  checked={userData.settings.notifications}
                  onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Статистика */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-brand-light">Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">{userData.currentDay}</div>
                <div className="text-dark-500 text-sm">Дней</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-secondary">{currentStreak}</div>
                <div className="text-dark-500 text-sm">Серия</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-accent">{userData.totalVisits}</div>
                <div className="text-dark-500 text-sm">Визитов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userData.achievements.length}
                </div>
                <div className="text-dark-500 text-sm">Достижений</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Данные */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-brand-light">Управление данными</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" onClick={handleExportData} fullWidth>
                📁 Экспорт данных планеты
              </Button>

              <div className="text-xs text-dark-500 text-center">Версия: {APP_VERSION}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="danger" onClick={() => setShowResetConfirm(true)} fullWidth>
              🗑️ Сбросить все данные
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Подтверждение сброса */}
      {showResetConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          <Card variant="primary" padding="lg">
            <CardHeader>
              <CardTitle className="text-center">⚠️ Подтверждение</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowResetConfirm(false)} fullWidth>
                  Отмена
                </Button>
                <Button variant="danger" onClick={handleResetData} fullWidth>
                  Сбросить
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SettingsScreen
