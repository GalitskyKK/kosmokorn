import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/components/ui/Button"
import { IUserData, IPlanetData } from "@/types"
import { PlanetGenerator } from "@/services/planetGenerator"

interface IDevToolsProps {
  userData: IUserData | null
  planetData: IPlanetData | null
  onSimulateDay: (targetDay: number) => void
  onResetTime: () => void
  className?: string
}

/**
 * Dev Tools для тестирования и отладки
 * Показываются только в development режиме
 */
const DevTools: React.FC<IDevToolsProps> = ({
  userData,
  planetData,
  onSimulateDay,
  onResetTime,
  className
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [targetDay, setTargetDay] = useState<number>(1)
  const [previewData, setPreviewData] = useState<IPlanetData | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false)

  // Показываем только в development режиме
  if (import.meta.env.PROD) {
    return null
  }

  if (!userData) {
    return null
  }

  const generatePreview = async (day: number) => {
    if (!userData.seed) return

    try {
      setIsGeneratingPreview(true)
      const generator = new PlanetGenerator(userData.seed)
      const preview = generator.generatePlanetData(day)
      setPreviewData(preview)
    } catch (error) {
      console.error("Ошибка генерации превью:", error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleDayChange = (day: number) => {
    setTargetDay(day)
    generatePreview(day)
  }

  const resetAllData = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <>
      {/* Кнопка открытия Dev Tools */}
      <motion.button
        className={`fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        title="Dev Tools">
        🛠️
      </motion.button>

      {/* Панель Dev Tools */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}>
            <motion.div
              className="min-h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}>
              <motion.div
                className="w-full max-w-2xl bg-gray-900 rounded-lg p-6 max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: "spring", damping: 20 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">🛠️ Dev Tools</h2>
                  <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
                    ✕
                  </Button>
                </div>

                {/* Текущее состояние */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">📊 Текущее состояние</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Планета:</span>
                      <span className="text-white">{userData.planetName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Seed:</span>
                      <span className="text-white font-mono text-xs">{userData.seed}</span>
                    </div>
                    {planetData && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Текущий день:</span>
                          <span className="text-white">{planetData.currentDay}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Стадия:</span>
                          <span className="text-white">{planetData.stage}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">События:</span>
                          <span className="text-white">{planetData.events.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Симуляция дней */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">🎯 Симуляция дней</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-400 min-w-0">День:</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={targetDay}
                        onChange={(e) => handleDayChange(parseInt(e.target.value) || 1)}
                        className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm"
                      />
                      <Button onClick={() => onSimulateDay(targetDay)} variant="primary" size="sm">
                        Симулировать
                      </Button>
                    </div>

                    {/* Быстрые кнопки */}
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 5, 7, 10, 15, 30, 60, 100].map((day) => (
                        <Button
                          key={day}
                          onClick={() => handleDayChange(day)}
                          variant="outline"
                          size="sm"
                          className="text-xs">
                          День {day}
                        </Button>
                      ))}
                    </div>

                    {/* Превью планеты для выбранного дня */}
                    {isGeneratingPreview && (
                      <div className="text-center text-gray-400 text-sm">Генерация превью...</div>
                    )}

                    {previewData && targetDay !== planetData?.currentDay && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-2">
                          Превью дня {targetDay}:
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Стадия:</span>
                            <span className="text-white">{previewData.stage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Температура:</span>
                            <span className="text-white">
                              {Math.round(previewData.temperature)}°K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Атмосфера:</span>
                            <span className="text-white">
                              {Math.round(previewData.atmosphere * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Вода:</span>
                            <span className="text-white">
                              {Math.round(previewData.water * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Жизнь:</span>
                            <span className="text-white">
                              {Math.round(previewData.life * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">События:</span>
                            <span className="text-white">{previewData.events.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Спутники:</span>
                            <span className="text-white">{previewData.satellites.length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Управление временем */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">⏰ Управление временем</h3>
                  <div className="space-y-3">
                    <Button onClick={onResetTime} variant="outline" fullWidth>
                      🔄 Сбросить время (к дню 1)
                    </Button>

                    <details className="bg-gray-800 rounded-lg">
                      <summary className="p-3 cursor-pointer text-sm text-gray-300 hover:text-white">
                        Данные localStorage
                      </summary>
                      <div className="p-3 pt-0 space-y-2">
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-gray-400">kosmokorn-data:</span>
                            <pre className="text-white bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(
                                JSON.parse(localStorage.getItem("kosmokorn-data") || "{}"),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                          <div>
                            <span className="text-gray-400">kosmokorn-last-visit:</span>
                            <pre className="text-white bg-gray-900 p-2 rounded text-xs">
                              {localStorage.getItem("kosmokorn-last-visit") || "null"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Опасные действия */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Опасные действия</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={resetAllData}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      fullWidth>
                      🗑️ Полный сброс (удалить все данные)
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Dev Tools доступны только в development режиме
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DevTools
